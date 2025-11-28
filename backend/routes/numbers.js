const express = require('express');
const { query } = require('../config/database');
const { requireClient, requireInternal } = require('../middleware/auth');

const router = express.Router();

// Get all numbers
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let params = [];

    if (userRole === 'Client') {
      // Clients can only see their own numbers
      whereClause = 'WHERE n.user_id = $1';
      params = [userId];
    }
    // Internal users and admins can see all numbers

    const result = await query(`
      SELECT
        n.*,
        c.countryname as country_name,
        p.name as product_name,
        o.order_number,
        o.customer_id,
        cust.company_name as customer_name,
        cust.email as customer_email,
        dr.status as disconnection_status,
        dr.requested_at as disconnection_requested_at
      FROM numbers n
      LEFT JOIN countries c ON n.country_id = c.id
      LEFT JOIN products p ON n.product_id = p.id
      LEFT JOIN orders o ON n.order_id = o.id
      LEFT JOIN customers cust ON o.customer_id = cust.id
      LEFT JOIN LATERAL (
        SELECT status, requested_at
        FROM disconnection_requests
        WHERE number_id = n.id
        ORDER BY requested_at DESC
        LIMIT 1
      ) dr ON true
      ${whereClause}
      ORDER BY n.created_at DESC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get numbers error:', error);
    res.status(500).json({
      success: false,
      message: error.message ||'Internal server error'
    });
  }
});

// Get available area codes for a country and product type
router.get('/area-codes/:countryId/:productId', async (req, res) => {
  try {
    const { countryId, productId } = req.params;

    const result = await query(`
      SELECT DISTINCT n.area_code
      FROM numbers n
      WHERE n.country_id = $1 AND n.product_id = $2 AND n.area_code IS NOT NULL
      ORDER BY n.area_code ASC
    `, [countryId, productId]);

    res.json({
      success: true,
      data: result.rows.map(row => row.area_code)
    });
  } catch (error) {
    console.error('Get area codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new number (for allocation)
router.post('/', requireInternal, async (req, res) => {
  try {
    const { orderId, number, areaCode } = req.body;

    // Validate required fields
    if (!orderId || !number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, number'
      });
    }

    // Fetch country_id and product_id from orders table
    const orderResult = await query(`
      SELECT country_id, product_id
      FROM orders
      WHERE id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { country_id: countryId, product_id: productId } = orderResult.rows[0];

    if (!countryId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Order is missing country_id or product_id'
      });
    }

    // Check if number already exists
    const existingNumber = await query('SELECT id FROM numbers WHERE number = $1', [number]);
    if (existingNumber.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Number already exists'
      });
    }

    const result = await query(`
      INSERT INTO numbers (order_id, number, country_id, product_id, area_code, status, activation_date)
      VALUES ($1, $2, $3, $4, $5, 'Active', CURRENT_DATE)
      RETURNING *
    `, [orderId, number, countryId, productId, areaCode]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create number error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Get numbers by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = 'n.order_id = $1';
    let params = [orderId];

    // If client, ensure they can only see their own numbers
    if (userRole === 'Client') {
      whereClause += ' AND n.user_id = $2';
      params.push(userId);
    }

    const result = await query(`
      SELECT
        n.*,
        c.countryname as country_name,
        p.name as product_name
      FROM numbers n
      LEFT JOIN countries c ON n.country_id = c.id
      LEFT JOIN products p ON n.product_id = p.id
      WHERE ${whereClause}
      ORDER BY n.created_at ASC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get numbers by order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Update user_id for numbers in an order (when delivering)
router.put('/order/:orderId/user', requireInternal, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get the customer user_id from the order
    const orderResult = await query(`
      SELECT c.user_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const customerUserId = orderResult.rows[0].user_id;

    if (!customerUserId) {
      return res.status(400).json({
        success: false,
        message: 'Customer user_id not found for this order'
      });
    }

    // Update all numbers for this order to set the user_id
    const updateResult = await query(`
      UPDATE numbers
      SET user_id = $1
      WHERE order_id = $2 AND user_id IS NULL
      RETURNING *
    `, [customerUserId, orderId]);

    res.json({
      success: true,
      data: updateResult.rows,
      message: `Updated ${updateResult.rows.length} numbers with user_id`
    });
  } catch (error) {
    console.error('Update numbers user_id error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Disconnect a number
router.patch('/:id/disconnect', requireInternal, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE numbers
       SET status = 'Disconnected', disconnection_date = CURRENT_DATE
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Number not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Number disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect number error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Delete a number (for deallocation)
router.delete('/:id', requireInternal, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM numbers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Number not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Number deleted successfully'
    });
  } catch (error) {
    console.error('Delete number error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
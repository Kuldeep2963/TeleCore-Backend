const express = require('express');
const { query } = require('../config/database');
const { requireClient, requireInternal } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { customer_id, vendor_id, country, product_type, service_name, start_date, end_date, status } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    // Role-based access control
    if (userRole === 'Client') {
      // Clients can only see their own orders
      whereClause += ` AND c.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (userRole === 'Internal' || userRole === 'Admin') {
      // Internal users and admins can see all orders, or filter by specific customer/vendor if specified
      if (customer_id) {
        whereClause += ` AND o.customer_id = $${paramIndex}`;
        params.push(customer_id);
        paramIndex++;
      }
      if (vendor_id) {
        whereClause += ` AND o.vendor_id = $${paramIndex}`;
        params.push(vendor_id);
        paramIndex++;
      }
    }

    // Additional filters
    if (country) {
      whereClause += ` AND LOWER(co.countryname) = LOWER($${paramIndex})`;
      params.push(country);
      paramIndex++;
    }

    if (product_type) {
      whereClause += ` AND LOWER(p.category) = LOWER($${paramIndex})`;
      params.push(product_type);
      paramIndex++;
    }

    if (service_name) {
      whereClause += ` AND LOWER(p.name) = LOWER($${paramIndex})`;
      params.push(service_name);
      paramIndex++;
    }

    if (start_date) {
      whereClause += ` AND o.order_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClause += ` AND o.order_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND LOWER(o.status) = LOWER($${paramIndex})`;
      params.push(status);
      paramIndex++;
    }

    const result = await query(`
      SELECT o.id, o.order_number, o.quantity, o.total_amount, o.status, o.order_date, o.created_at,
             c.company_name, c.contact_person,
             v.name as vendor_name,
             p.name as product_name, p.category as product_category,
             co.countryname as country_name, co.phonecode as country_code,
             STRING_AGG(DISTINCT n.area_code, ', ') as area_codes
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vendors v ON o.vendor_id = v.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN countries co ON o.country_id = co.id
      LEFT JOIN numbers n ON o.id = n.order_id
      WHERE 1=1 ${whereClause}
      GROUP BY o.id, c.company_name, c.contact_person, v.name, p.name, p.category, co.countryname, co.phonecode
      ORDER BY o.created_at DESC
    `, params);

    // Transform data to match frontend expectations
    const transformedData = result.rows.map(order => ({
      id: order.id,
      orderNo: order.order_number,
      country: order.country_name || 'N/A',
      productType: order.product_category || 'N/A',
      serviceName: order.product_name || 'N/A', // Using product name as service name
      areaCode: order.area_codes || 'N/A', // Area codes from numbers table
      quantity: order.quantity,
      orderStatus: order.status,
      orderDate: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : null,
      created_at: order.created_at,
      totalAmount: order.total_amount,
      companyName: order.company_name,
      vendorName: order.vendor_name
    }));

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT o.*, c.company_name, c.contact_person, v.name as vendor_name, p.name as product_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vendors v ON o.vendor_id = v.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_id, vendor_id, product_id, quantity, total_amount, status, notes } = req.body;

    if (!customer_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and Product ID are required'
      });
    }

    const result = await query(`
      INSERT INTO orders (customer_id, vendor_id, product_id, quantity, total_amount, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [customer_id, vendor_id || null, product_id, quantity || 1, total_amount || 0, status || 'Pending', notes || null]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, vendor_id, product_id, quantity, total_amount, status, notes } = req.body;

    const result = await query(`
      UPDATE orders
      SET customer_id = COALESCE($1, customer_id),
          vendor_id = COALESCE($2, vendor_id),
          product_id = COALESCE($3, product_id),
          quantity = COALESCE($4, quantity),
          total_amount = COALESCE($5, total_amount),
          status = COALESCE($6, status),
          notes = COALESCE($7, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [customer_id, vendor_id, product_id, quantity, total_amount, status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await query(`
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM orders
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
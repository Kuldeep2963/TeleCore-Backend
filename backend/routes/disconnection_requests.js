const express = require('express');
const { query } = require('../config/database');
const { requireClient, requireInternal } = require('../middleware/auth');

const router = express.Router();

// Get all disconnection requests
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let params = [];

    if (userRole === 'Client') {
      // Clients can only see their own disconnection requests
      whereClause = ' AND c.user_id = $1';
      params = [userId];
    }
    // Internal users and admins can see all disconnection requests

    const result = await query(`
      SELECT dr.*,
             n.number,
             o.order_number,
             c.company_name as customer_name,
             c.email as customer_email,
             p.name as product_name
      FROM disconnection_requests dr
      LEFT JOIN numbers n ON dr.number_id = n.id
      LEFT JOIN orders o ON dr.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE 1=1 ${whereClause}
      ORDER BY dr.requested_at DESC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get disconnection requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get disconnection request by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT dr.*,
             n.number,
             o.order_number,
             c.company_name as customer_name,
             c.email as customer_email,
             p.name as product_name
      FROM disconnection_requests dr
      LEFT JOIN numbers n ON dr.number_id = n.id
      LEFT JOIN orders o ON dr.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE dr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disconnection request not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get disconnection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create disconnection request
router.post('/', async (req, res) => {
  try {
    const { number_id, order_id, notes } = req.body;

    if (!number_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'Number ID and Order ID are required'
      });
    }

    const result = await query(`
      INSERT INTO disconnection_requests (number_id, order_id, notes)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [number_id, order_id, notes || null]);

    res.status(201).json({
      success: true,
      message: 'Disconnection request created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create disconnection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update disconnection request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await query(`
      UPDATE disconnection_requests
      SET status = $1,
          processed_at = CURRENT_TIMESTAMP,
          notes = COALESCE($2, notes)
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disconnection request not found'
      });
    }

    res.json({
      success: true,
      message: 'Disconnection request status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update disconnection request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update disconnection request
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { number_id, order_id, status, notes } = req.body;

    const result = await query(`
      UPDATE disconnection_requests
      SET number_id = COALESCE($1, number_id),
          order_id = COALESCE($2, order_id),
          status = COALESCE($3, status),
          notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING *
    `, [number_id, order_id, status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disconnection request not found'
      });
    }

    res.json({
      success: true,
      message: 'Disconnection request updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update disconnection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete disconnection request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM disconnection_requests
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disconnection request not found'
      });
    }

    res.json({
      success: true,
      message: 'Disconnection request deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete disconnection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
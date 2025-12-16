const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireClient, requireInternal } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireInternal, async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.email as user_email, u.first_name, u.last_name,
             COUNT(o.id) as total_orders,
             SUM(o.total_amount) as total_spent,
             MAX(o.order_date) as last_order_date
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id, u.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT c.*, u.email as user_email, u.first_name, u.last_name
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found for current user'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get current customer error:', error);
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
      SELECT c.*, u.email as user_email, u.first_name, u.last_name
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { company_name, contact_person, email, phone, location, status, user_id } = req.body;

    if (!company_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Company name and email are required'
      });
    }

    const result = await query(`
      INSERT INTO customers (company_name, contact_person, email, phone, location, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [company_name, contact_person || null, email, phone || null, location || null, status || 'Active', user_id || null]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, contact_person, email, phone, location, status } = req.body;

    const result = await query(`
      UPDATE customers
      SET company_name = COALESCE($1, company_name),
          contact_person = COALESCE($2, contact_person),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          location = COALESCE($5, location),
          status = COALESCE($6, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [company_name, contact_person, email, phone, location, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update customer error:', error);
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
      DELETE FROM customers
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
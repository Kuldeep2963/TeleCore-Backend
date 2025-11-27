const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT v.*,
             COUNT(o.id) as total_orders,
             COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) as completed_orders
      FROM vendors v
      LEFT JOIN orders o ON v.id = o.vendor_id
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get vendors error:', error);
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
      SELECT v.*,
             COUNT(o.id) as total_orders,
             COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) as completed_orders
      FROM vendors v
      LEFT JOIN orders o ON v.id = o.vendor_id
      WHERE v.id = $1
      GROUP BY v.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, location, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const result = await query(`
      INSERT INTO vendors (name, email, phone, location, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, email, phone || null, location || null, status || 'Active']);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, location, status } = req.body;

    const result = await query(`
      UPDATE vendors
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          location = COALESCE($4, location),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, email, phone, location, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update vendor error:', error);
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
      DELETE FROM vendors
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
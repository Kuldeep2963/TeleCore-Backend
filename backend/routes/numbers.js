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
        dr.status as disconnection_status,
        dr.requested_at as disconnection_requested_at
      FROM numbers n
      LEFT JOIN countries c ON n.country_id = c.id
      LEFT JOIN products p ON n.product_id = p.id
      LEFT JOIN orders o ON n.order_id = o.id
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

module.exports = router;
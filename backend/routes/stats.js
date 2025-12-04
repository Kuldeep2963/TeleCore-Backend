const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get all counts in parallel
    const [vendorsResult, customersResult, productsResult, ordersResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM vendors'),
      query('SELECT COUNT(*) as count FROM customers'),
      query("SELECT COUNT(*) as count FROM products WHERE status = 'Active'"),
      query('SELECT COUNT(*) as count FROM orders')
    ]);

    const stats = {
      totalVendors: parseInt(vendorsResult.rows[0].count),
      totalCustomers: parseInt(customersResult.rows[0].count),
      activeProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all countries
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT countryname, phonecode, availableproducts
      FROM countries
      ORDER BY countryname ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get country by name
router.get('/:countryname', async (req, res) => {
  try {
    const { countryname } = req.params;

    const result = await query(`
      SELECT countryname, phonecode, availableproducts
      FROM countries
      WHERE countryname = $1
    `, [countryname]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
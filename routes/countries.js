const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all countries
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, countryname, phonecode, availableproducts
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

// Get country by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, countryname, phonecode, availableproducts
      FROM countries
      WHERE id = $1
    `, [id]);

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

// Create new country
router.post('/', async (req, res) => {
  try {
    const { countryname, phonecode, availableproducts } = req.body;

    if (!countryname || !phonecode) {
      return res.status(400).json({
        success: false,
        message: 'Country name and phone code are required'
      });
    }

    const result = await query(`
      INSERT INTO countries (countryname, phonecode, availableproducts)
      VALUES ($1, $2, $3)
      RETURNING id, countryname, phonecode, availableproducts
    `, [countryname, phonecode, JSON.stringify(availableproducts) || '[]']);

    res.status(201).json({
      success: true,
      message: 'Country created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create country error:', error);
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        message: 'Country already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Update country
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { countryname, phonecode, availableproducts } = req.body;

    const result = await query(`
      UPDATE countries
      SET countryname = COALESCE($1, countryname),
          phonecode = COALESCE($2, phonecode),
          availableproducts = COALESCE($3, availableproducts)
      WHERE id = $4
      RETURNING id, countryname, phonecode, availableproducts
    `, [countryname, phonecode, availableproducts ? JSON.stringify(availableproducts) : null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.json({
      success: true,
      message: 'Country updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete country
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM countries WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Country not found'
      });
    }

    res.json({
      success: true,
      message: 'Country deleted successfully'
    });
  } catch (error) {
    console.error('Delete country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all service details
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT sd.*, p.name as product_name, p.code as product_code,
             c.countryname as country_name
      FROM service_details sd
      JOIN products p ON sd.product_id = p.id
      JOIN countries c ON sd.country_id = c.id
      WHERE sd.status = 'Active'
      ORDER BY sd.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get service details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get service details by product and country
router.get('/product/:productId/country/:countryId', async (req, res) => {
  try {
    const { productId, countryId } = req.params;

    const result = await query(`
      SELECT sd.*, p.name as product_name, p.code as product_code,
             c.countryname as country_name
      FROM service_details sd
      JOIN products p ON sd.product_id = p.id
      JOIN countries c ON sd.country_id = c.id
      WHERE sd.product_id = $1 AND sd.country_id = $2 AND sd.status = 'Active'
    `, [productId, countryId]);

    if (result.rows.length === 0) {
      // Return default service details if none found
      return res.json({
        success: true,
        data: {
          id: null,
          product_id: productId,
          country_id: countryId,
          restrictions: 'None',
          channels: 'SMS, Voice',
          portability: 'Yes',
          fix_coverage: 'Supported',
          mobile_coverage: 'Supported',
          payphone_coverage: 'Not Supported',
          default_channels: 2,
          maximum_channels: 10,
          extra_channel_price: 45.00,
          status: 'Active',
          product_name: '',
          country_name: ''
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get service details by product/country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new service details
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      country_id,
      restrictions,
      channels,
      portability,
      fix_coverage,
      mobile_coverage,
      payphone_coverage,
      default_channels,
      maximum_channels,
      extra_channel_price
    } = req.body;

    const result = await query(`
      INSERT INTO service_details (
        product_id, country_id, restrictions, channels, portability,
        fix_coverage, mobile_coverage, payphone_coverage, default_channels,
        maximum_channels, extra_channel_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      product_id, country_id, restrictions, channels, portability,
      fix_coverage, mobile_coverage, payphone_coverage, default_channels,
      maximum_channels, extra_channel_price
    ]);

    res.status(201).json({
      success: true,
      message: 'Service details created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create service details error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Service details already exist for this product and country'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Update service details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      restrictions,
      channels,
      portability,
      fix_coverage,
      mobile_coverage,
      payphone_coverage,
      default_channels,
      maximum_channels,
      extra_channel_price,
      status
    } = req.body;

    const result = await query(`
      UPDATE service_details SET
        restrictions = $1, channels = $2, portability = $3, fix_coverage = $4,
        mobile_coverage = $5, payphone_coverage = $6, default_channels = $7,
        maximum_channels = $8, extra_channel_price = $9, status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      restrictions, channels, portability, fix_coverage, mobile_coverage,
      payphone_coverage, default_channels, maximum_channels, extra_channel_price,
      status, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service details not found'
      });
    }

    res.json({
      success: true,
      message: 'Service details updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update service details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete service details
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM service_details WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service details not found'
      });
    }

    res.json({
      success: true,
      message: 'Service details deleted successfully'
    });
  } catch (error) {
    console.error('Delete service details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all pricing plans
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT pp.*, p.name as product_name, p.code as product_code,
             c.name as country_name, c.code as country_code
      FROM pricing_plans pp
      JOIN products p ON pp.product_id = p.id
      JOIN countries c ON pp.country_id = c.id
      WHERE pp.status = 'Active'
      ORDER BY pp.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pricing plan by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT pp.*, p.name as product_name, p.code as product_code,
             c.name as country_name, c.code as country_code
      FROM pricing_plans pp
      JOIN products p ON pp.product_id = p.id
      JOIN countries c ON pp.country_id = c.id
      WHERE pp.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get pricing plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pricing by product and country
router.get('/product/:productId/country/:countryId', async (req, res) => {
  try {
    const { productId, countryId } = req.params;

    const result = await query(`
      SELECT * FROM pricing_plans
      WHERE product_id = $1 AND country_id = $2 AND status = 'Active'
      AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
      ORDER BY effective_from DESC
      LIMIT 1
    `, [productId, countryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found for this product and country'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get pricing by product/country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new pricing plan
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      country_id,
      nrc,
      mrc,
      ppm,
      ppm_fix,
      ppm_mobile,
      ppm_payphone,
      arc,
      mo,
      mt,
      incoming_ppm,
      outgoing_ppm_fix,
      outgoing_ppm_mobile,
      incoming_sms,
      outgoing_sms,
      billing_pulse,
      estimated_lead_time,
      contract_term,
      disconnection_notice_term,
      effective_from,
      effective_to
    } = req.body;

    const result = await query(`
      INSERT INTO pricing_plans (
        product_id, country_id, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone,
        arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile,
        incoming_sms, outgoing_sms, billing_pulse, estimated_lead_time,
        contract_term, disconnection_notice_term, effective_from, effective_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `, [
      product_id, country_id, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone,
      arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile,
      incoming_sms, outgoing_sms, billing_pulse, estimated_lead_time,
      contract_term, disconnection_notice_term, effective_from, effective_to
    ]);

    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create pricing plan error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Pricing plan already exists for this product, country, and effective date'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Update pricing plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone, arc, mo, mt,
      incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile, incoming_sms, outgoing_sms,
      billing_pulse, estimated_lead_time, contract_term, disconnection_notice_term,
      effective_to, status
    } = req.body;

    const result = await query(`
      UPDATE pricing_plans SET
        nrc = $1, mrc = $2, ppm = $3, ppm_fix = $4, ppm_mobile = $5, ppm_payphone = $6,
        arc = $7, mo = $8, mt = $9, incoming_ppm = $10, outgoing_ppm_fix = $11,
        outgoing_ppm_mobile = $12, incoming_sms = $13, outgoing_sms = $14,
        billing_pulse = $15, estimated_lead_time = $16, contract_term = $17,
        disconnection_notice_term = $18, effective_to = $19, status = $20,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
      RETURNING *
    `, [
      nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone, arc, mo, mt,
      incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile, incoming_sms, outgoing_sms,
      billing_pulse, estimated_lead_time, contract_term, disconnection_notice_term,
      effective_to, status, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Pricing plan updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update pricing plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
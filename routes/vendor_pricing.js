const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT vp.*, v.name as vendor_name, p.name as product_name, p.code as product_code,
             c.countryname as country_name, c.phonecode
      FROM vendor_pricing vp
      JOIN vendors v ON vp.vendor_id = v.id
      JOIN products p ON vp.product_id = p.id
      JOIN countries c ON vp.country_id = c.id
      WHERE vp.status = 'Active'
      ORDER BY vp.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get vendor pricing error:', error);
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
      SELECT vp.*, v.name as vendor_name, p.name as product_name, p.code as product_code,
             c.countryname as country_name, c.phonecode
      FROM vendor_pricing vp
      JOIN vendors v ON vp.vendor_id = v.id
      JOIN products p ON vp.product_id = p.id
      JOIN countries c ON vp.country_id = c.id
      WHERE vp.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor pricing not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get vendor pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const result = await query(`
      SELECT vp.*, v.name as vendor_name, p.name as product_name, p.code as product_code,
             c.countryname as country_name, c.phonecode
      FROM vendor_pricing vp
      JOIN vendors v ON vp.vendor_id = v.id
      JOIN products p ON vp.product_id = p.id
      JOIN countries c ON vp.country_id = c.id
      WHERE vp.vendor_id = $1
      AND vp.status = 'Active'
      ORDER BY p.name ASC, c.countryname ASC
    `, [vendorId]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get vendor pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/vendor/:vendorId/product/:productId/country/:countryId', async (req, res) => {
  try {
    const { vendorId, productId, countryId } = req.params;

    const result = await query(`
      SELECT vp.* FROM vendor_pricing vp
      WHERE vp.vendor_id = $1
      AND vp.product_id = $2
      AND vp.country_id = $3
      AND vp.status = 'Active'
      LIMIT 1
    `, [vendorId, productId, countryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor pricing not found for this combination'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get vendor pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      vendor_id,
      product_id,
      country_id,
      area_codes,
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
      effective_to,
      status
    } = req.body;

    if (!vendor_id || !product_id || !country_id) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, Product ID, and Country ID are required'
      });
    }

    const areaCodesToStore = Array.isArray(area_codes) ? area_codes : (area_codes ? area_codes.split(',').map(code => code.trim()) : null);

    const result = await query(`
      INSERT INTO vendor_pricing (
        vendor_id, product_id, country_id, area_codes, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone,
        arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile,
        incoming_sms, outgoing_sms, billing_pulse, estimated_lead_time,
        contract_term, disconnection_notice_term, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `, [
      vendor_id, product_id, country_id, areaCodesToStore, nrc, mrc, ppm, ppm_fix, ppm_mobile, ppm_payphone,
      arc, mo, mt, incoming_ppm, outgoing_ppm_fix, outgoing_ppm_mobile,
      incoming_sms, outgoing_sms, billing_pulse || '60/60', estimated_lead_time || '15 Days',
      contract_term || '1 Month', disconnection_notice_term || '1 Month', status || 'Active'
    ]);

    res.status(201).json({
      success: true,
      message: 'Vendor pricing created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create vendor pricing error:', error);
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        message: 'Vendor pricing already exists for this vendor, product, country, and effective date'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      'nrc', 'mrc', 'ppm', 'ppm_fix', 'ppm_mobile', 'ppm_payphone', 'arc', 'mo', 'mt',
      'incoming_ppm', 'outgoing_ppm_fix', 'outgoing_ppm_mobile', 'incoming_sms', 'outgoing_sms',
      'billing_pulse', 'estimated_lead_time', 'contract_term', 'disconnection_notice_term',
      'status', 'area_codes'
    ];

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field) && req.body[field] !== undefined && req.body[field] !== null) {
        let value = req.body[field];
        if (field === 'area_codes') {
          value = Array.isArray(value) ? value : (value ? value.split(',').map(code => code.trim()) : null);
        }
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateValues.push(id);
    const idParamIndex = updateValues.length;

    const result = await query(`
      UPDATE vendor_pricing SET
        ${updateFields.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor pricing not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor pricing updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update vendor pricing error:', error);
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
      DELETE FROM vendor_pricing
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor pricing not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor pricing deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete vendor pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

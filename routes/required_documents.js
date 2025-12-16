const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all required documents
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT rd.*, p.name as product_name, p.code as product_code,
             c.countryname as country_name
      FROM required_documents rd
      JOIN products p ON rd.product_id = p.id
      JOIN countries c ON rd.country_id = c.id
      WHERE rd.status = 'Active'
      ORDER BY rd.product_id, rd.country_id, rd.document_name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get required documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get required documents by product and country
router.get('/product/:productId/country/:countryId', async (req, res) => {
  try {
    const { productId, countryId } = req.params;

    const result = await query(`
      SELECT rd.*, p.name as product_name, p.code as product_code,
             c.countryname as country_name
      FROM required_documents rd
      JOIN products p ON rd.product_id = p.id
      JOIN countries c ON rd.country_id = c.id
      WHERE rd.product_id = $1 AND rd.country_id = $2 AND rd.status = 'Active'
      ORDER BY rd.document_name ASC
    `, [productId, countryId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get required documents by product/country error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new required document
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      country_id,
      document_name,
      document_code,
      description,
      is_required
    } = req.body;

    const result = await query(`
      INSERT INTO required_documents (
        product_id, country_id, document_name, document_code, description, is_required
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      product_id, country_id, document_name, document_code, description, is_required
    ]);

    res.status(201).json({
      success: true,
      message: 'Required document created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create required document error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Document code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Update required document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      document_name,
      document_code,
      description,
      is_required,
      status
    } = req.body;

    const result = await query(`
      UPDATE required_documents SET
        document_name = $1, document_code = $2, description = $3,
        is_required = $4, status = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      document_name, document_code, description, is_required, status, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Required document not found'
      });
    }

    res.json({
      success: true,
      message: 'Required document updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update required document error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Document code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

// Delete required document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM required_documents WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Required document not found'
      });
    }

    res.json({
      success: true,
      message: 'Required document deleted successfully'
    });
  } catch (error) {
    console.error('Delete required document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
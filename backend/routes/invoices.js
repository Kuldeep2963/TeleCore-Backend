const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, c.company_name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT i.*, c.company_name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Get invoice items
    const itemsResult = await query(`
      SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const {
      customer_id,
      order_id,
      amount,
      due_date,
      period,
      from_date,
      to_date,
      notes,
      items
    } = req.body;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const result = await query(`
      INSERT INTO invoices (invoice_number, customer_id, order_id, amount, due_date, period, from_date, to_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [invoiceNumber, customer_id, order_id, amount, due_date, period, from_date, to_date, notes]);

    const invoice = result.rows[0];

    // Add invoice items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await query(`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
          VALUES ($1, $2, $3, $4, $5)
        `, [invoice.id, item.description, item.quantity, item.unit_price, item.total]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paid_date } = req.body;

    const result = await query(`
      UPDATE invoices
      SET status = $1, paid_date = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, paid_date, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, order_id, amount, due_date, period, from_date, to_date, notes, status } = req.body;

    const result = await query(`
      UPDATE invoices
      SET customer_id = COALESCE($1, customer_id),
          order_id = COALESCE($2, order_id),
          amount = COALESCE($3, amount),
          due_date = COALESCE($4, due_date),
          period = COALESCE($5, period),
          from_date = COALESCE($6, from_date),
          to_date = COALESCE($7, to_date),
          notes = COALESCE($8, notes),
          status = COALESCE($9, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [customer_id, order_id, amount, due_date, period, from_date, to_date, notes, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update invoice error:', error);
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
      DELETE FROM invoices
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
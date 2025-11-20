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
      mrc_amount,
      usage_amount,
      amount,
      due_date,
      period,
      from_date,
      to_date,
      notes,
      items
    } = req.body;

    // Calculate total amount if not provided
    const totalAmount = amount || (parseFloat(mrc_amount || 0) + parseFloat(usage_amount || 0));

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const result = await query(`
      INSERT INTO invoices (invoice_number, customer_id, order_id, mrc_amount, usage_amount, amount, due_date, period, from_date, to_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [invoiceNumber, customer_id, order_id, mrc_amount || 0, usage_amount || 0, totalAmount, due_date, period, from_date, to_date, notes]);

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
    const { customer_id, order_id, mrc_amount, usage_amount, amount, due_date, period, from_date, to_date, notes, status } = req.body;

    // Calculate total amount if MRC or usage amount is being updated
    let totalAmount = amount;
    if (mrc_amount !== undefined || usage_amount !== undefined) {
      const currentResult = await query('SELECT mrc_amount, usage_amount FROM invoices WHERE id = $1', [id]);
      if (currentResult.rows.length > 0) {
        const current = currentResult.rows[0];
        const newMrc = mrc_amount !== undefined ? parseFloat(mrc_amount) : parseFloat(current.mrc_amount);
        const newUsage = usage_amount !== undefined ? parseFloat(usage_amount) : parseFloat(current.usage_amount);
        totalAmount = newMrc + newUsage;
      }
    }

    const result = await query(`
      UPDATE invoices
      SET customer_id = COALESCE($1, customer_id),
          order_id = COALESCE($2, order_id),
          mrc_amount = COALESCE($3, mrc_amount),
          usage_amount = COALESCE($4, usage_amount),
          amount = COALESCE($5, amount),
          due_date = COALESCE($6, due_date),
          period = COALESCE($7, period),
          from_date = COALESCE($8, from_date),
          to_date = COALESCE($9, to_date),
          notes = COALESCE($10, notes),
          status = COALESCE($11, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [customer_id, order_id, mrc_amount, usage_amount, totalAmount, due_date, period, from_date, to_date, notes, status, id]);

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

// Update usage amount for an invoice
router.patch('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { usage_amount } = req.body;

    if (usage_amount === undefined || usage_amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid usage amount is required'
      });
    }

    // Get current MRC amount
    const currentResult = await query('SELECT mrc_amount FROM invoices WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const mrcAmount = parseFloat(currentResult.rows[0].mrc_amount);
    const newUsageAmount = parseFloat(usage_amount);
    const newTotalAmount = mrcAmount + newUsageAmount;

    const result = await query(`
      UPDATE invoices
      SET usage_amount = $1, amount = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [newUsageAmount, newTotalAmount, id]);

    res.json({
      success: true,
      message: 'Usage amount updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update usage amount error:', error);
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
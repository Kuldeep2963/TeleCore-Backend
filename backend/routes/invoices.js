const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireInternal } = require('../middleware/auth');
const { generateMonthlyInvoices } = require('../jobs/invoiceScheduler');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Manual trigger for invoice generation (for testing)
router.post('/manual-trigger/generate', async (req, res) => {
  try {
    await generateMonthlyInvoices();
    res.json({
      success: true,
      message: 'Invoice generation triggered successfully'
    });
  } catch (error) {
    console.error('Manual invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger invoice generation',
      error: error.message
    });
  }
});

// Get all invoices (with role-based filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'Client') {
      // For clients, only return their own invoices
      result = await query(`
        SELECT i.*, 
               c.company_name as customer_name,
               o.area_code,
               p.category as product_type,
               co.countryname as country_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN countries co ON o.country_id = co.id
        WHERE c.user_id = $1
        ORDER BY i.created_at DESC
      `, [req.user.id]);
    } else {
      // For internal/admin users, return all invoices
      result = await query(`
        SELECT i.*, 
               c.company_name as customer_name,
               o.area_code,
               p.category as product_type,
               co.countryname as country_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN products p ON o.product_id = p.id
        LEFT JOIN countries co ON o.country_id = co.id
        ORDER BY i.created_at DESC
      `);
    }

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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT i.*, c.company_name as customer_name, c.user_id
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

    const invoice = result.rows[0];

    // Check access control for clients
    if (req.user.role === 'Client' && invoice.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// Get detailed invoice with all related information for PDF generation (must come before /:id)
router.get('/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let result;
    
    result = await query(`
      SELECT i.*,
             c.company_name as customer_name,
             c.email as customer_email,
             c.phone as customer_phone,
             c.location as customer_address,
             c.user_id,
             o.area_code,
             o.quantity,
             o.completed_date,
             p.name as product_name,
             p.category as product_type,
             co.countryname as country_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN countries co ON o.country_id = co.id
      WHERE i.id::text = $1 OR i.invoice_number = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    // Check access control for clients
    if (req.user.role === 'Client' && invoice.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


// Generate monthly recurring invoice for an order
router.post('/generate-recurring/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await query(`
      SELECT o.id, o.customer_id, o.completed_date, o.quantity, c.company_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1 AND o.status = 'Delivered' AND o.completed_date IS NOT NULL
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order not found or not yet delivered'
      });
    }

    const order = orderResult.rows[0];

    const pricingResult = await query(`
      SELECT mrc FROM order_pricing
      WHERE order_id = $1 AND pricing_type IN ('current', 'desired')
      ORDER BY CASE 
        WHEN pricing_type = 'current' THEN 0 
        ELSE 1 
      END,
      created_at DESC
      LIMIT 1
    `, [orderId]);

    if (pricingResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pricing information not found for this order'
      });
    }

    const mrc = Number(pricingResult.rows[0].mrc) || 0;
    const quantity = Number(order.quantity) || 1;
    const mrcAmount = mrc * quantity;
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 10);

    const period = invoiceDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const fromDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 1);
    const toDate = new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 0);

    const invoiceNumber = `INV-${Date.now()}`;

    const result = await query(`
      INSERT INTO invoices (invoice_number, customer_id, order_id, mrc_amount, usage_amount, amount, due_date, period, from_date, to_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      invoiceNumber,
      order.customer_id,
      orderId,
      mrcAmount,
      0,
      mrcAmount,
      dueDate,
      period,
      fromDate,
      toDate
    ]);

    res.status(201).json({
      success: true,
      message: 'Monthly invoice generated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Generate recurring invoice error:', error);
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
      notes
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

router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let result;
    
    result = await query(`
      SELECT i.*,
             c.company_name as customer_name,
             c.email as customer_email,
             c.phone as customer_phone,
             c.location as customer_address,
             c.user_id,
             o.area_code,
             o.quantity,
             o.completed_date,
             p.name as product_name,
             p.category as product_type,
             co.countryname as country_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN countries co ON o.country_id = co.id
      WHERE i.id::text = $1 OR i.invoice_number = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    if (req.user.role === 'Client' && invoice.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download this invoice'
      });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fileName = `Invoice_${invoice.invoice_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    doc.pipe(res);

    const pageWidth = 595;
    let y = 20;

    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const currency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

    const drawSectionTitle = (title) => {
      doc.fontSize(12).font('Helvetica-Bold').text(title, 50, y);
      y += 8;
      doc.font('Helvetica').fontSize(10);
    };

    const drawLine = () => {
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke();
      y += 10;
    };

    const drawRow = (label, value) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(label, 50, y);
      doc.text(String(value), pageWidth - 140, y);
      y += 7;
    };

    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    y += 15;

    doc.fontSize(10).font('Helvetica');
    drawRow('Invoice Number:', invoice.invoice_number || 'N/A');
    drawRow('Invoice Date:', formatDate(invoice.created_at));
    drawRow('Customer:', invoice.customer_name || 'N/A');
    drawRow('Due Date:', formatDate(invoice.due_date));

    if (invoice.customer_email) drawRow('Email:', invoice.customer_email);
    if (invoice.customer_phone) drawRow('Phone:', invoice.customer_phone);
    if (invoice.country_name || invoice.area_code) {
      drawRow('Location:', `${invoice.country_name || ''} ${invoice.area_code || ''}`.trim());
    }

    drawLine();

    drawSectionTitle('Invoice Details');

    const detailRows = [
      ['Period', invoice.period || 'N/A'],
      ['From Date', formatDate(invoice.from_date)],
      ['To Date', formatDate(invoice.to_date)],
      ['Product', invoice.product_name || 'N/A'],
      ['Product Type', invoice.product_type || 'N/A'],
      ['Quantity', invoice.quantity || 'N/A']
    ];

    detailRows.forEach(([label, value]) => drawRow(label + ':', value));

    drawLine();

    drawSectionTitle('Charges');

    drawRow('MRC Amount:', currency(invoice.mrc_amount));
    drawRow('Usage Amount:', currency(invoice.usage_amount));

    drawLine();

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total Amount:', 50, y);
    doc.text(currency(invoice.amount), pageWidth - 140, y);
    y += 12;

    doc.fontSize(10).font('Helvetica');
    drawRow('Status:', invoice.status || 'N/A');

    if (invoice.paid_date) drawRow('Paid Date:', formatDate(invoice.paid_date));

    if (invoice.notes) {
      y += 8;
      doc.font('Helvetica-Bold').text('Notes:', 50, y);
      y += 7;
      doc.font('Helvetica');
      doc.text(String(invoice.notes), 50, y, { width: pageWidth - 100, wrap: true });
    }

    doc.end();
  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
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
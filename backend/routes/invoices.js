const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireInternal } = require('../middleware/auth');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('../jobs/invoiceScheduler');
const emailService = require('../services/emailService');
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

// Manual trigger for overdue invoice status update (for testing)
router.post('/manual-trigger/check-overdue', async (req, res) => {
  try {
    await updateOverdueInvoices();
    res.json({
      success: true,
      message: 'Overdue invoice check triggered successfully'
    });
  } catch (error) {
    console.error('Manual overdue invoice check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger overdue invoice check',
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
               co.countryname as country_name,
               COALESCE((SELECT COUNT(*) FROM numbers WHERE order_id = i.order_id AND status = 'Active'), 0) as active_numbers_count
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
               co.countryname as country_name,
               COALESCE((SELECT COUNT(*) FROM numbers WHERE order_id = i.order_id AND status = 'Active'), 0) as active_numbers_count
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
      notes,
      rate_per_minute,
      duration
    } = req.body;

    let finalUsageAmount = 0;
    let finalRate = 0;
    let finalDuration = 0;

    // Calculate usage amount if rate and duration are provided
    if (rate_per_minute !== undefined && rate_per_minute !== null && duration !== undefined && duration !== null) {
      const rate = parseFloat(rate_per_minute);
      const durationSeconds = parseInt(duration);
      
      if (!isNaN(rate) && !isNaN(durationSeconds) && isFinite(rate) && isFinite(durationSeconds)) {
        const durationMinutes = durationSeconds / 60;
        finalUsageAmount = parseFloat((rate * durationMinutes).toFixed(2));
        finalRate = rate;
        finalDuration = durationSeconds;
      } else if (usage_amount !== undefined && usage_amount !== null) {
        finalUsageAmount = parseFloat(usage_amount) || 0;
      }
    } else if (usage_amount !== undefined && usage_amount !== null) {
      finalUsageAmount = parseFloat(usage_amount) || 0;
    }

    // Calculate total amount
    const mrcValue = parseFloat(mrc_amount || 0);
    const totalAmount = amount || parseFloat((mrcValue + finalUsageAmount).toFixed(2));

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const result = await query(`
      INSERT INTO invoices (invoice_number, customer_id, order_id, mrc_amount, usage_amount, amount, due_date, period, from_date, to_date, notes, rate_per_minute, duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [invoiceNumber, customer_id, order_id, mrcValue, finalUsageAmount, totalAmount, due_date, period, from_date, to_date, notes || null, finalRate, finalDuration]);

    const invoice = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { customer_id, order_id, mrc_amount, usage_amount, amount, due_date, period, from_date, to_date, notes, status, rate_per_minute, duration } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // Handle rate_per_minute and duration calculation
    let finalUsageAmount = undefined;
    let finalRate = rate_per_minute;
    let finalDuration = duration;

    if (rate_per_minute !== undefined && rate_per_minute !== null && duration !== undefined && duration !== null) {
      const rate = parseFloat(rate_per_minute);
      const durationSec = parseInt(duration);
      
      if (!isNaN(rate) && !isNaN(durationSec) && isFinite(rate) && isFinite(durationSec)) {
        const durationMin = durationSec / 60;
        finalUsageAmount = parseFloat((rate * durationMin).toFixed(2));
      }
    }

    // Add fields to update
    if (customer_id !== undefined && customer_id !== null) {
      updates.push(`customer_id = $${paramIndex}`);
      params.push(customer_id);
      paramIndex++;
    }

    if (order_id !== undefined && order_id !== null) {
      updates.push(`order_id = $${paramIndex}`);
      params.push(order_id);
      paramIndex++;
    }

    if (mrc_amount !== undefined && mrc_amount !== null) {
      updates.push(`mrc_amount = $${paramIndex}`);
      params.push(mrc_amount);
      paramIndex++;
    }

    if (finalUsageAmount !== undefined) {
      updates.push(`usage_amount = $${paramIndex}`);
      params.push(finalUsageAmount);
      paramIndex++;
    } else if (usage_amount !== undefined && usage_amount !== null) {
      updates.push(`usage_amount = $${paramIndex}`);
      params.push(usage_amount);
      paramIndex++;
    }

    // Calculate and set amount if usage changed
    if (finalUsageAmount !== undefined || usage_amount !== undefined) {
      const currentResult = await query('SELECT mrc_amount FROM invoices WHERE id = $1', [id]);
      if (currentResult.rows.length > 0) {
        const mrc = parseFloat(currentResult.rows[0].mrc_amount || 0);
        const usage = finalUsageAmount !== undefined ? finalUsageAmount : parseFloat(usage_amount || 0);
        const totalAmount = parseFloat((mrc + usage).toFixed(2));
        updates.push(`amount = $${paramIndex}`);
        params.push(totalAmount);
        paramIndex++;
      }
    } else if (amount !== undefined && amount !== null) {
      updates.push(`amount = $${paramIndex}`);
      params.push(amount);
      paramIndex++;
    }

    if (due_date !== undefined && due_date !== null) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(due_date);
      paramIndex++;
    }

    if (period !== undefined && period !== null) {
      updates.push(`period = $${paramIndex}`);
      params.push(period);
      paramIndex++;
    }

    if (from_date !== undefined && from_date !== null) {
      updates.push(`from_date = $${paramIndex}`);
      params.push(from_date);
      paramIndex++;
    }

    if (to_date !== undefined && to_date !== null) {
      updates.push(`to_date = $${paramIndex}`);
      params.push(to_date);
      paramIndex++;
    }

    if (notes !== undefined && notes !== null) {
      updates.push(`notes = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }

    if (status !== undefined && status !== null) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (finalRate !== undefined && finalRate !== null) {
      updates.push(`rate_per_minute = $${paramIndex}`);
      params.push(finalRate);
      paramIndex++;
    }

    if (finalDuration !== undefined && finalDuration !== null) {
      updates.push(`duration = $${paramIndex}`);
      params.push(finalDuration);
      paramIndex++;
    }

    // Always update timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      // Only updated_at
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Add ID to params
    params.push(id);

    const sql = `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    console.log('Update query:', sql);
    console.log('Update params:', params);

    const result = await query(sql, params);

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
    console.error('Update invoice error:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
 //////////////////////////////////////////////////////////////////////////////// PDF GENERATION
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


    const doc = new PDFDocument({
      size: 'A4',
      margin: 60,
      bufferPages: true
    });
    
    const fileName = `${invoice.invoice_number}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    doc.pipe(res);

    // Constants for styling
    const colors = {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#e74c3c',
      lightGray: '#ecf0f1',
      darkGray: '#2c3e50',
      success: '#27ae60',
      warning: '#f39c12',
      heading: '#1a252f',
      subheading: '#2c3e50'
    };

    const fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique'
    };

    // Helper functions
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

    const formatStatus = (status) => {
      const statusColors = {
        'paid': colors.success,
        'pending': colors.warning,
        'overdue': colors.accent,
      };
      return {
        text: status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A',
        color: statusColors[status?.toLowerCase()] || colors.darkGray
      };
    };

    // Header Section with background
    doc.rect(0, 0, doc.page.width, 90)
       .fill(colors.lightGray);
    
       // Company Logo
    try {
      // Adjust the path to your logo file
      const logoPath = './public/pai-telecom-logo.png'; 
      
      // Add logo (adjust width and height as needed)
      doc.image(logoPath, 15, 15, { 
        width: 80, 
        height: 30,
        fit: [80, 30] 
      });
      
      // Contact info below logo (adjust Y position as needed)
      doc.font(fonts.regular)
         .fontSize(8)
         .fillColor(colors.darkGray)
         .text('810, 8th Floor, Vipul Bussiness Park, Sector 48',15 , 55)
         .text('Gurgaon, Haryana-201018', 15, 65)
          .text('kuldeep.tyagi@telecore.com', 15, 75);
         
    } catch (error) {
      console.log('Logo not found, using text fallback');
      // Fallback to text if image fails
      doc.font(fonts.bold)
         .fontSize(16)
         .fillColor(colors.heading)
         .text('Pai Telecom', 40, 20);
      
      doc.font(fonts.regular)
         .fontSize(8)
         .fillColor(colors.darkGray)
         .text('810, 8th Floor, Vipul Bussiness Park, Sector 48', 130, 20)
         .text('Gurgaon, Haryana-201018 | kuldeep.tyagi@telecore.com', 130, 28);
    }
    // Invoice Title
    doc.font(fonts.bold)
       .fontSize(18)
       .fillColor(colors.heading)
       .text('INVOICE', doc.page.width - 240, 25, { align: 'right' });
    
    doc.fontSize(11)
       .fillColor(colors.darkGray)
       .text(invoice.invoice_number || 'N/A', doc.page.width - 240, 48, { align: 'right' });

    // Bill To Section
    let y = 105;
    doc.fontSize(15)
       .font(fonts.bold)
       .fillColor(colors.heading)
       .text('Billing To', 40, y);
    
    y += 25;
    doc.fontSize(12)
       .font(fonts.bold)
       .fillColor(colors.darkGray)
       .text(invoice.customer_name || 'N/A', 40, y);
    
    y += 15;
    doc.fontSize(10)
       .font(fonts.regular)
       .fillColor(colors.darkGray);
    
    if (invoice.customer_address) {
      doc.text(invoice.customer_address, 40, y);
      y += 15;
    }
    
    if (invoice.customer_email) {
      doc.text(invoice.customer_email, 40, y);
      y += 15;
    }
    
    if (invoice.customer_phone) {
      doc.text(invoice.customer_phone, 40, y);
      y += 12;
    }

    // Invoice Details Box
    const boxWidth = 220;
    const boxX = doc.page.width - boxWidth - 40;
    let detailY = 105;
    
    doc.rect(boxX, detailY, boxWidth, 85)
       .fill(colors.lightGray);
    
    doc.fontSize(15)
       .font(fonts.bold)
       .fillColor(colors.heading)
       .text('Invoice Details', boxX + 15, detailY + 12);
    
    detailY += 35;
    doc.fontSize(10)
       .font(fonts.regular)
       .fillColor(colors.darkGray);
    
    const details = [
      { label: 'Invoice Date', value: formatDate(invoice.invoice_date || invoice.created_at) },
      { label: 'Due Date', value: formatDate(invoice.due_date) },
      { label: 'Status', value: formatStatus(invoice.status).text, color: formatStatus(invoice.status).color }
    ];
    
    details.forEach((detail, index) => {
      doc.text(detail.label + ':', boxX + 15, detailY + (index * 15));
      doc.font(fonts.bold)
         .fillColor(detail.color || colors.primary)
         .text(detail.value, boxX + 100, detailY + (index * 15), { width: boxWidth - 115, align: 'right' })
         .font(fonts.regular)
         .fillColor(colors.darkGray);
    });
    
    y = Math.max(y + 15, detailY + 50);
    y += 15;

    // Additional Information Section (Before Invoice Summary)
    doc.fontSize(13)
       .font(fonts.bold)
       .fillColor(colors.heading)
       .text('Service Details', 40, y);
    
    y += 25;
    
    doc.fontSize(10)
       .font(fonts.regular)
       .fillColor(colors.darkGray);
    
    const infoRows = [
      { label: 'Product Type', value: invoice.product_type || 'N/A' },
      { label: 'Period', value: invoice.period || 'N/A' },
      { label: 'From Date', value: formatDate(invoice.from_date) },
      { label: 'To Date', value: formatDate(invoice.to_date) },
      { label: 'Location', value: `${invoice.country_name || ''} ${invoice.area_code || ''}`.trim() || 'N/A' },
      { label: 'Completed Date', value: formatDate(invoice.completed_date) }
    ];
    
    const infoColWidth = (doc.page.width - 120) / 2;
    let infoStartY = y;
    infoRows.forEach((row, index) => {
      const col = Math.floor(index / 3);
      const rowInCol = index % 3;
      const x = 40 + (col * infoColWidth);
      const rowY = infoStartY + (rowInCol * 18);
      
      doc.font(fonts.bold)
         .fillColor(colors.primary)
         .text(row.label + ' :', x, rowY, { width: 90 });
      
      doc.font(fonts.regular)
         .fillColor(colors.darkGray)
         .text(row.value, x + 100, rowY, { width: infoColWidth - 80 });
    });
    
    y = infoStartY + 70;

    // Invoice Items Table
    doc.fontSize(15)
       .font(fonts.bold)
       .fillColor(colors.heading)
       .text('Invoice Summary', 40, y);
    
    y += 25;
    
    // Table Header
    doc.rect(40, y, doc.page.width - 80, 22)
       .fill(colors.secondary);
    
    doc.fontSize(10)
       .font(fonts.bold)
       .fillColor('#ffffff');
    
    const columnWidth = (doc.page.width - 120) / 4;
    doc.text('Description', 50, y + 6, { width: columnWidth - 10 });
    doc.text('Rate/Min', 50 + columnWidth, y + 6, { width: columnWidth, align: 'center' });
    doc.text('Duration', 50 + (columnWidth * 2), y + 6, { width: columnWidth, align: 'center' });
    doc.text('Amount', 50 + (columnWidth * 3), y + 6, { width: columnWidth - 10, align: 'right' });
    
    y += 22;
    
    // Table Rows
    const formatDuration = (seconds) => {
      if (!seconds) return '-';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (secs === 0) return `${mins}m`;
      return `${mins}m ${secs}s`;
    };

    const items = [
      {
        description: 'MRC Amount',
        ratePerMin: '-',
        duration: '-',
        quantity: '-',
        amount: currency(invoice.mrc_amount)
      },
      {
        description: 'Usage Amount',
        ratePerMin: invoice.rate_per_minute ? currency(invoice.rate_per_minute) : '-',
        duration: invoice.duration ? formatDuration(invoice.duration) : '-',
        quantity: '-',
        amount: currency(invoice.usage_amount)
      }
    ];
    
    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : colors.lightGray;
      doc.rect(40, y, doc.page.width - 80, 25)
         .fill(bgColor);
      
      doc.fontSize(9)
         .font(fonts.regular)
         .fillColor(colors.darkGray)
         .text(item.description, 50, y + 8);
      
      doc.text(item.ratePerMin, 50 + columnWidth, y + 8, { width: columnWidth, align: 'center' });
      
      doc.text(item.duration, 50 + (columnWidth * 2), y + 8, { width: columnWidth, align: 'center' });
      
      doc.font(fonts.bold)
         .fillColor(colors.primary)
         .text(item.amount, 50 + (columnWidth * 3), y + 8, { width: columnWidth - 10, align: 'right' });
      
      y += 25;
    });

    // Total Section
    y += 20;
    doc.rect(doc.page.width - 300, y, 260, 65)
       .stroke(colors.darkGray);
    
    
    y += 25;
    doc.fontSize(14)
       .font(fonts.bold)
       .fillColor(colors.heading)
       .text('Total :-', doc.page.width - 280, y);
    
    doc.fontSize(16)
       .fillColor(colors.accent)
       .text(currency(invoice.amount), doc.page.width - 140, y, { align: 'right' });

    // Notes Section (if exists)
    if (invoice.notes) {
      y += 15;
      doc.fontSize(12)
         .font(fonts.bold)
         .fillColor(colors.heading)
         .text('Notes', 40, y);
      
      y += 20;
      doc.rect(40, y, doc.page.width - 80, 60)
         .fill(colors.lightGray)
         .stroke(colors.darkGray);
      
      doc.fontSize(10)
         .font(fonts.regular)
         .fillColor(colors.darkGray)
         .text(invoice.notes, 50, y + 15, {
           width: doc.page.width - 100,
           align: 'left'
         });
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
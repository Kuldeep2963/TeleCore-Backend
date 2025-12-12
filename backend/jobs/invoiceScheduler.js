const cron = require('node-cron');
const { query } = require('../config/database');
const emailService = require('../services/emailService');

// Utility: Generate invoice number in format "orderNumber-month"
const generateInvoiceNumber = (orderNumber, month) => {
  return `${orderNumber}-${month}`;
};

// Utility: Get previous month start/end safely (IST timezone)
const getPreviousMonthRange = () => {
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);

  // Previous month (IST)
  const prevMonthStart = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth() - 1, 1));
  const prevMonthEnd = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), 0));

  // Period format: YYYY-MM (best for storage)
  const period = `${prevMonthStart.getUTCFullYear()}-${String(
    prevMonthStart.getUTCMonth() + 1
  ).padStart(2, '0')}`;

  return { prevMonthStart, prevMonthEnd, period };
};

const generateMonthlyInvoices = async () => {
  try {
    const { prevMonthStart, prevMonthEnd, period } = getPreviousMonthRange();

    console.log(`\n📋 Invoice Generation Started at ${new Date().toISOString()}`);
    console.log(`📅 Processing period: ${period}`);
    console.log(`📍 Date range: ${prevMonthStart.toISOString()} to ${prevMonthEnd.toISOString()}`);

    // Fetch orders delivered in previous month with no invoice yet
    const deliveredOrders = await query(
      `
      SELECT o.id, o.order_number, o.customer_id, o.country_id, o.product_id, o.area_code, o.completed_date, o.quantity
      FROM orders o
      WHERE o.status = 'Delivered'
        AND o.completed_date IS NOT NULL
        AND DATE_TRUNC('month', o.completed_date::timestamp AT TIME ZONE 'UTC')
            = DATE_TRUNC('month', $1::timestamptz)
        AND NOT EXISTS (
          SELECT 1 FROM invoices
          WHERE order_id = o.id
            AND DATE_TRUNC('month', from_date::timestamp AT TIME ZONE 'UTC')
                = DATE_TRUNC('month', $1::timestamptz)
        )
    `,
      [prevMonthStart]
    );

    if (deliveredOrders.rows.length === 0) {
      console.log(`⚠️  No delivered orders found for period ${period}`);
      return;
    }

    console.log(`✅ Found ${deliveredOrders.rows.length} delivered orders to invoice`);

    for (const order of deliveredOrders.rows) {
      try {
        // Count active numbers for this order
        const activeNumbersResult = await query(
          `
          SELECT COUNT(*) as active_count
          FROM numbers
          WHERE order_id = $1 AND status = 'Active'
          `,
          [order.id]
        );

        const activeCount = parseInt(activeNumbersResult.rows[0].active_count) || 0;

        if (activeCount === 0) {
          console.log(`⚠️ Order ${order.id} has no active numbers, skipping invoice`);
          continue;
        }

        // Get MRC pricing - try 'current' first, then fallback to 'desired'
        const pricingResult = await query(
          `
          SELECT mrc FROM order_pricing
          WHERE order_id = $1 AND pricing_type IN ('current', 'desired')
          ORDER BY CASE 
            WHEN pricing_type = 'current' THEN 0 
            ELSE 1 
          END,
          created_at DESC
          LIMIT 1
        `,
          [order.id]
        );

        if (pricingResult.rows.length === 0) {
          console.log(`⚠️ No pricing (current or desired) found for order ${order.id}, skipping invoice`);
          continue;
        }

        const mrcAmount = Number(pricingResult.rows[0].mrc) * activeCount;
        const usageAmount = 0; // For now; usage fills later from CDR

        const amount = mrcAmount + usageAmount;

        const invoiceDate = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istInvoiceDate = new Date(invoiceDate.getTime() + istOffset);
        const month = String(istInvoiceDate.getUTCMonth() + 1).padStart(2, '0');
        const invoiceNumber = generateInvoiceNumber(order.order_number, month);

        const dueDate = new Date(invoiceDate.getTime() + 10 * 24 * 60 * 60 * 1000);

        // Calculate from_date and to_date based on order completion date
        const completionDate = new Date(order.completed_date);
        const istCompletion = new Date(completionDate.getTime() + istOffset);
        
        // from_date: completion date (same day)
        const fromDate = new Date(Date.UTC(istCompletion.getUTCFullYear(), istCompletion.getUTCMonth(), istCompletion.getUTCDate()));
        
        // to_date: same date of next month
        const toDate = new Date(Date.UTC(istCompletion.getUTCFullYear(), istCompletion.getUTCMonth() + 1, istCompletion.getUTCDate()));

        // Insert securely with duplicate prevention
        const insertResult = await query(
          `
          INSERT INTO invoices 
            (invoice_number, customer_id, order_id, mrc_amount, usage_amount, amount, 
             due_date, period, from_date, to_date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending')
          ON CONFLICT (invoice_number) DO NOTHING
          RETURNING id
        `,
          [
            invoiceNumber,
            order.customer_id,
            order.id,
            mrcAmount,
            usageAmount,
            amount,
            dueDate,
            period, // safe format: YYYY-MM
            fromDate,
            toDate
          ]
        );

        if (insertResult.rows.length > 0) {
          try {
            const customerResult = await query('SELECT u.email FROM customers c JOIN users u ON c.user_id = u.id WHERE c.id = $1', [order.customer_id]);
            
            if (customerResult.rows.length > 0) {
              const customerEmail = customerResult.rows[0].email;
              await emailService.sendInvoiceGeneratedEmail(customerEmail, invoiceNumber, amount, dueDate.toISOString().split('T')[0], period);
            }
          } catch (emailError) {
            console.error(`Error sending invoice generated email for ${invoiceNumber}:`, emailError);
          }
        }

        console.log(`✅ Invoice generated for order ${order.id}: ${invoiceNumber} (Active numbers: ${activeCount}, MRC: ${mrcAmount})`);
      } catch (err) {
        console.error(`❌ Error generating invoice for order ${order.id}`, err);
      }
    }

    console.log(`✔ Monthly invoice generation completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Fatal invoice scheduler error:", error);
  }
};

const updateOverdueInvoices = async () => {
  try {
    console.log(`\n📋 Overdue Invoice Check Started at ${new Date().toISOString()}`);

    const result = await query(
      `
      UPDATE invoices
      SET status = 'Overdue', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'Pending' 
        AND due_date <= CURRENT_DATE
      RETURNING id, invoice_number, due_date, amount, customer_id
    `
    );

    if (result.rows.length > 0) {
      console.log(`✅ Updated ${result.rows.length} invoices to Overdue status`);
      
      for (const invoice of result.rows) {
        console.log(`   - Invoice ${invoice.invoice_number} (Due: ${invoice.due_date})`);
        
        try {
          const customerResult = await query('SELECT u.email FROM customers c JOIN users u ON c.user_id = u.id WHERE c.id = $1', [invoice.customer_id]);
          
          if (customerResult.rows.length > 0) {
            const customerEmail = customerResult.rows[0].email;
            await emailService.sendInvoiceOverdueEmail(customerEmail, invoice.invoice_number, invoice.amount, invoice.due_date.toISOString().split('T')[0]);
          }
        } catch (emailError) {
          console.error(`Error sending overdue invoice email for ${invoice.invoice_number}:`, emailError);
        }
      }
    } else {
      console.log(`ℹ️  No overdue invoices found to update`);
    }

    console.log(`✔ Overdue invoice check completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Fatal overdue invoice update error:", error);
  }
};

const checkInvoiceOverdueWarnings = async () => {
  try {
    console.log(`\n📋 Invoice Overdue Warning Check Started at ${new Date().toISOString()}`);

    const result = await query(
      `
      SELECT i.id, i.invoice_number, i.due_date, i.amount, i.customer_id
      FROM invoices i
      WHERE i.status = 'Pending' 
        AND i.due_date > CURRENT_DATE
        AND i.due_date <= CURRENT_DATE + INTERVAL '4 days'
    `
    );

    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} invoices due in 4 days`);
      
      for (const invoice of result.rows) {
        const daysRemaining = Math.ceil((new Date(invoice.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        
        try {
          const customerResult = await query('SELECT u.email FROM customers c JOIN users u ON c.user_id = u.id WHERE c.id = $1', [invoice.customer_id]);
          
          if (customerResult.rows.length > 0) {
            const customerEmail = customerResult.rows[0].email;
            await emailService.sendInvoiceOverdueWarningEmail(customerEmail, invoice.invoice_number, invoice.amount, invoice.due_date.toISOString().split('T')[0], daysRemaining);
          }
        } catch (emailError) {
          console.error(`Error sending overdue warning email for ${invoice.invoice_number}:`, emailError);
        }
      }
    } else {
      console.log(`ℹ️  No invoices due in 4 days found`);
    }

    console.log(`✔ Invoice overdue warning check completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Fatal invoice overdue warning check error:", error);
  }
};

const startInvoiceScheduler = () => {
  // RUN EVERY DAY AT 00:00 (midnight) - Generate monthly invoices
  cron.schedule(
    "13 17 * * *",
    async () => {
      console.log("Running daily invoice generation check at midnight...");
      await generateMonthlyInvoices();
    },
    { timezone: "Asia/Kolkata" }
  );

  // RUN EVERY DAY AT 12:59 IST (07:29 UTC) - Check and update overdue invoices
  cron.schedule(
    "22 14 * * *",
    async () => {
      console.log("Running daily overdue invoice check...");
      await updateOverdueInvoices();
    },
    { timezone: "Asia/Kolkata" }
  );

  // RUN EVERY DAY AT 06:00 AM IST - Check invoices due in 4 days
  cron.schedule(
    "30 6 * * *",
    async () => {
      console.log("Running invoice overdue warning check...");
      await checkInvoiceOverdueWarnings();
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("Invoice scheduler initialized:");
  console.log("  - Monthly invoice generation: daily at 00:00 UTC");
  console.log("  - Overdue invoice check: daily at 12:59 IST (07:29 UTC)");
  console.log("  - Overdue warning check: daily at 06:00 AM IST");
};

module.exports = { startInvoiceScheduler, generateMonthlyInvoices, updateOverdueInvoices, checkInvoiceOverdueWarnings };

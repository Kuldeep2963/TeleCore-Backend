const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function seedData() {
  try {
    console.log('Seeding data...');

    // Hash passwords for all users
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const internalPasswordHash = await bcrypt.hash('Internal@123', 10);
    const sarahPasswordHash = await bcrypt.hash('Sarah@123', 10);
    const johnPasswordHash = await bcrypt.hash('John@123', 10);
    const mikePasswordHash = await bcrypt.hash('Mike@123', 10);
    const emmaPasswordHash = await bcrypt.hash('Emma@123', 10);

    // Update all user passwords
    await query(`
      UPDATE users SET password_hash = CASE
        WHEN email = 'admin@telecore.com' THEN $1
        WHEN email = 'internal@telecore.com' THEN $2
        WHEN email = 'sarah@telecore.com' THEN $3
        WHEN email = 'john.smith@email.com' THEN $4
        WHEN email = 'mike.chen@email.com' THEN $5
        WHEN email = 'emma.davis@email.com' THEN $6
        ELSE password_hash
      END
    `, [adminPasswordHash, internalPasswordHash, sarahPasswordHash, johnPasswordHash, mikePasswordHash, emmaPasswordHash]);

    // Get Sarah Johnson's user ID
    const userResult = await query(`
      SELECT id FROM users WHERE email = $1
    `, ['sarah@telecore.com']);

    if (userResult.rows.length === 0) {
      throw new Error('Sarah Johnson user not found');
    }

    const sarahUserId = userResult.rows[0].id;

    // Create customer record for Sarah Johnson if it doesn't exist
    await query(`
      INSERT INTO customers (user_id, company_name, contact_person, email, phone, location)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [sarahUserId, 'Johnson Enterprises', 'Sarah Johnson', 'sarah@telecore.com', '+1-555-0123', 'New York, USA']);

    // Get customer ID
    const customerResult = await query(`
      SELECT id FROM customers WHERE email = $1
    `, ['sarah@telecore.com']);

    const customerId = customerResult.rows[0].id;

    // Get sample vendor, product, and country IDs
    const vendorResult = await query(`
      SELECT id FROM vendors LIMIT 1
    `);

    let vendorId = null;
    if (vendorResult.rows.length > 0) {
      vendorId = vendorResult.rows[0].id;
    }

    const productResult = await query(`
      SELECT id FROM products WHERE code = $1
    `, ['did']);

    const countryResult = await query(`
      SELECT id FROM countries WHERE countryname = $1
    `, ['United States']);

    if (productResult.rows.length === 0 || countryResult.rows.length === 0) {
      throw new Error('Required product or country not found');
    }

    const productId = productResult.rows[0].id;
    const countryId = countryResult.rows[0].id;

    // Create sample orders for Sarah Johnson
    const orders = [
      {
        order_number: 'ORD-2024-001',
        quantity: 5,
        total_amount: 120.00,
        status: 'Delivered',
        order_date: '2024-01-15',
        completed_date: '2024-01-30'
      },
      {
        order_number: 'ORD-2024-002',
        quantity: 3,
        total_amount: 72.00,
        status: 'Amount Paid',
        order_date: '2024-02-10',
        completed_date: null
      },
      {
        order_number: 'ORD-2024-003',
        quantity: 10,
        total_amount: 240.00,
        status: 'In Progress',
        order_date: '2024-03-01',
        completed_date: null
      }
    ];

    const orderIds = [];
    for (const order of orders) {
      const orderResult = await query(`
        INSERT INTO orders (order_number, customer_id, vendor_id, product_id, country_id, quantity, total_amount, status, order_date, completed_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        order.order_number,
        customerId,
        vendorId,
        productId,
        countryId,
        order.quantity,
        order.total_amount,
        order.status,
        order.order_date,
        order.completed_date
      ]);

      orderIds.push(orderResult.rows[0].id);
    }

    // Create sample numbers for the orders
    const numbers = [
      { number: '+15551234567', area_code: '551', order_index: 0 },
      { number: '+15551234568', area_code: '551', order_index: 0 },
      { number: '+15551234569', area_code: '551', order_index: 0 },
      { number: '+15551234570', area_code: '551', order_index: 0 },
      { number: '+15551234571', area_code: '551', order_index: 0 },
      { number: '+15559876543', area_code: '559', order_index: 1 },
      { number: '+15559876544', area_code: '559', order_index: 1 },
      { number: '+15559876545', area_code: '559', order_index: 1 },
      { number: '+15558765432', area_code: '558', order_index: 2 },
      { number: '+15558765433', area_code: '558', order_index: 2 },
      { number: '+15558765434', area_code: '558', order_index: 2 },
      { number: '+15558765435', area_code: '558', order_index: 2 },
      { number: '+15558765436', area_code: '558', order_index: 2 },
      { number: '+15558765437', area_code: '558', order_index: 2 },
      { number: '+15558765438', area_code: '558', order_index: 2 },
      { number: '+15558765439', area_code: '558', order_index: 2 },
      { number: '+15558765440', area_code: '558', order_index: 2 },
      { number: '+15558765441', area_code: '558', order_index: 2 }
    ];

    for (const num of numbers) {
      await query(`
        INSERT INTO numbers (user_id, order_id, number, country_id, product_id, area_code, status, activation_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        sarahUserId,
        orderIds[num.order_index],
        num.number,
        countryId,
        productId,
        num.area_code,
        'Active',
        orders[num.order_index].completed_date || '2024-01-15'
      ]);
    }

    // Create sample invoices for Sarah Johnson
    const invoices = [
      {
        invoice_number: 'INV-2024-001',
        order_id: orderIds[0],
        amount: 120.00,
        status: 'Paid',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        paid_date: '2024-01-20',
        period: 'Jan-2024',
        from_date: '2024-01-01',
        to_date: '2024-01-31'
      },
      {
        invoice_number: 'INV-2024-002',
        order_id: orderIds[1],
        amount: 72.00,
        status: 'Paid',
        invoice_date: '2024-02-10',
        due_date: '2024-03-10',
        paid_date: '2024-02-15',
        period: 'Feb-2024',
        from_date: '2024-02-01',
        to_date: '2024-02-29'
      },
      {
        invoice_number: 'INV-2024-003',
        order_id: orderIds[2],
        amount: 240.00,
        status: 'Pending',
        invoice_date: '2024-03-01',
        due_date: '2024-04-01',
        paid_date: null,
        period: 'Mar-2024',
        from_date: '2024-03-01',
        to_date: '2024-03-31'
      }
    ];

    for (const invoice of invoices) {
      const invoiceResult = await query(`
        INSERT INTO invoices (invoice_number, customer_id, order_id, amount, status, invoice_date, due_date, paid_date, period, from_date, to_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        invoice.invoice_number,
        customerId,
        invoice.order_id,
        invoice.amount,
        invoice.status,
        invoice.invoice_date,
        invoice.due_date,
        invoice.paid_date,
        invoice.period,
        invoice.from_date,
        invoice.to_date
      ]);

      // Add invoice items
      await query(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_amount, service_period_start, service_period_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        invoiceResult.rows[0].id,
        'DID Numbers Service',
        orders[invoices.indexOf(invoice)].quantity,
        24.00,
        invoice.amount,
        invoice.from_date,
        invoice.to_date
      ]);
    }

    console.log('Sample data seeded successfully for Sarah Johnson');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit();
  }
}

seedData();
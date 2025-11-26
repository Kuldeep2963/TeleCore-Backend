import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'telecore_db',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT id, invoice_number, customer_id, status, amount FROM invoices LIMIT 10', (err, res) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Invoices in database:', res.rows);
  }
  pool.end();
});
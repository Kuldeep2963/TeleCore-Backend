const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  let pool;

  try {
    console.log('Starting database seeding...');

    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    // Insert Products
    const products = [
      { name: 'DID', code: 'DID', description: 'In-country numbers for global coverage.', category: 'DID' },
      { name: 'Freephone', code: 'FREEPHONE', description: 'Local toll-free numbers for easy customer access.', category: 'Freephone' },
      { name: 'Universal Freephone', code: 'UNIV_FREEPHONE', description: 'One toll-free number for multiple countries.', category: 'Universal Freephone' },
      { name: 'Two Way SMS', code: 'TWO_WAY_SMS', description: 'Effective two-way sms communication.', category: 'Two Way SMS' },
      { name: 'Two Way Voice', code: 'TWO_WAY_VOICE', description: 'Seamless, reliable two-way calling.', category: 'Two Way Voice' },
      { name: 'Mobile', code: 'MOBILE', description: 'All-in-one voice and sms numbers.', category: 'Mobile' }
    ];

    console.log('\nInserting products...');
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, code, description, category, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [product.name, product.code, product.description, product.category, 'Active']
      );
      console.log(`✓ Product created: ${product.name}`);
    }

    console.log('\nSeeding completed successfully!');
    console.log('\nLogin Credentials:');
    console.log('─────────────────');
    console.log('Client Account:');
    console.log('  Email: ankit.tyagi@telecore.com');
    console.log('  Password: Ankit@12345');
    console.log('  Role: Client');
    console.log('\nInternal Account:');
    console.log('  Email: kuldeep.tyagi@telecore.com');
    console.log('  Password: Kuldeep@12345');
    console.log('  Role: Internal');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    if (pool) await pool.end();
  }
}

seedDatabase();

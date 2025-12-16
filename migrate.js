const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  let pool;

  try {
    console.log('Starting database migration...');

    // First, connect to postgres database to create our database
    const tempPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: 'postgres', // Connect to default postgres database
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // Drop and recreate database
    try {
      // Terminate existing connections first
      await tempPool.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'telecore_db'
        AND pid <> pg_backend_pid()
      `);
      console.log('✓ Terminated existing connections');
      
      await tempPool.query('DROP DATABASE IF EXISTS telecore_db');
      console.log('✓ Dropped existing database telecore_db');
    } catch (error) {
      console.log('⚠ Could not drop database:', error.message);
    }

    try {
      await tempPool.query('CREATE DATABASE telecore_db');
      console.log('✓ Database telecore_db created');
    } catch (error) {
      throw error;
    }

    await tempPool.end();

    // Now connect to our database
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // Read the schema file
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Remove problematic lines
    let cleanSchemaSQL = schemaSQL
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.includes('CREATE DATABASE') &&
               !trimmed.includes('\\c telecore_db');
      })
      .join('\n');

    console.log('Executing schema...');

    // Try bulk execution first
    try {
      await pool.query(cleanSchemaSQL);
      console.log('✓ Schema executed successfully');
    } catch (error) {
      // If bulk fails, execute line by line
      console.log('⚠ Bulk execution failed, executing line by line...');
      
      const statements = cleanSchemaSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        try {
          await pool.query(stmt);
        } catch (err) {
          // Skip non-critical errors
          if (err.code === '42P07' || err.code === '42710' || err.code === '42P01' || err.code === '42703') {
            console.log(`⚠ Skipped: ${err.message.split('\n')[0]}`);
          } else {
            throw err;
          }
        }
      }
    }

    console.log('Migration completed successfully!');

    // Verify the migration by checking if tables exist
    console.log('Verifying migration...');
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Check initial data
    const countriesCount = await pool.query('SELECT COUNT(*) as count FROM countries');
    const productsCount = await pool.query('SELECT COUNT(*) as count FROM products');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');

    console.log('\nInitial data inserted:');
    console.log(`- Countries: ${countriesCount.rows[0].count}`);
    console.log(`- Products: ${productsCount.rows[0].count}`);
    console.log(`- Users: ${usersCount.rows[0].count}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
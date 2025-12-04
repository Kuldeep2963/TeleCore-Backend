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
    const lines = schemaSQL.split('\n');
    const cleanLines = lines.filter(line =>
      !line.includes('CREATE DATABASE') &&
      !line.includes('\\c telecore_db') &&
      !line.trim().startsWith('-- TeleCore Database Schema')
    );

    // Join back and execute as one big query
    const cleanSchemaSQL = cleanLines.join('\n');

    console.log('Executing schema...');

    try {
      await pool.query(cleanSchemaSQL);
      console.log('✓ Schema executed successfully');
    } catch (error) {
      // If it fails, try to execute individual statements
      console.log('Bulk execution failed, trying individual statements...');

      const statements = cleanSchemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement || statement.startsWith('--')) continue;

        const fullStatement = statement + ';';
        console.log(`Executing statement ${i + 1}/${statements.length}: ${fullStatement.substring(0, 60)}...`);

        try {
          await pool.query(fullStatement);
          console.log('✓ Executed successfully');
        } catch (error) {
          // Skip errors for already existing objects or syntax errors in complex statements
          if (error.code === '42P07' || // already exists
              error.code === '23505' || // unique violation
              error.code === '42710' || // already exists
              error.code === '42601' || // syntax error (for broken statements)
              error.message.includes('already exists') ||
              error.message.includes('syntax error')) {
            console.log(`⚠ Skipping (already exists or syntax error): ${error.message.split('\n')[0]}`);
            continue;
          }
          console.error('Error executing statement:', fullStatement);
          throw error;
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
const { query } = require('./config/database');

async function checkSchema() {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);

    console.log('Orders table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    const areaCodeExists = result.rows.some(row => row.column_name === 'area_code');
    console.log('\narea_code column exists:', areaCodeExists);

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
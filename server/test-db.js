// Test script to verify database connection and discover table structure
require('dotenv').config();
const db = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DB Type:', process.env.DB_TYPE);
    console.log('DB Host:', process.env.DB_HOST);
    console.log('DB Port:', process.env.DB_PORT);
    console.log('DB Name:', process.env.DB_NAME);
    console.log('DB User:', process.env.DB_USER);
    
    await db.connect();
    console.log('✅ Database connection successful!');
    
    // List all tables in the database
    console.log('\n📋 Discovering tables in database...');
    const tables = await db.query(`
      SELECT TABLE_NAME, TABLE_TYPE 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_CATALOG = '${process.env.DB_NAME}'
      ORDER BY TABLE_NAME
    `);
    
    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME} (${table.TABLE_TYPE})`);
    });
    
    // Look for log-related tables
    const logTables = tables.filter(t => 
      t.TABLE_NAME.toLowerCase().includes('log') || 
      t.TABLE_NAME.toLowerCase().includes('event') ||
      t.TABLE_NAME.toLowerCase().includes('audit')
    );
    
    if (logTables.length > 0) {
      console.log('\n🔍 Found potential log tables:');
      logTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
      
      // Get column structure for the first log table
      const tableName = logTables[0].TABLE_NAME;
      console.log(`\n📊 Column structure for ${tableName}:`);
      
      const columns = await db.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)'}`);
      });
      
      // Get sample data
      console.log(`\n📝 Sample data from ${tableName}:`);
      const sampleData = await db.query(`SELECT TOP 3 * FROM ${tableName}`);
      console.log(JSON.stringify(sampleData, null, 2));
      
      // Get record count
      const count = await db.query(`SELECT COUNT(*) as total FROM ${tableName}`);
      console.log(`\n📊 Total records in ${tableName}: ${count[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Database operation failed:', error.message);
    
    // More specific error handling
    if (error.code === 'ELOGIN') {
      console.log('\n🔧 Login troubleshooting:');
      console.log('1. Verify username and password are correct');
      console.log('2. Check if SQL Server authentication is enabled');
      console.log('3. Verify the user has access to the database');
      console.log('4. Check firewall/security group settings');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Verify the server hostname and port');
      console.log('2. Check if SQL Server is running');
      console.log('3. Verify firewall settings');
    }
    
  } finally {
    await db.close();
    console.log('\n🔒 Database connection closed.');
  }
}

testConnection();

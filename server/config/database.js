const { Pool } = require('pg');
const mysql = require('mysql2/promise');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.dbType = process.env.DB_TYPE || 'postgresql';
  }

  async connect() {
    try {
      if (this.dbType === 'postgresql') {
        this.connection = new Pool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

        // Test the connection
        const client = await this.connection.connect();
        console.log('Connected to PostgreSQL database');
        client.release();
        
      } else if (this.dbType === 'mysql') {
        this.connection = mysql.createPool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 3306,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? {} : false,
          connectionLimit: 20,
          acquireTimeout: 60000,
          timeout: 60000,
        });

        // Test the connection
        const connection = await this.connection.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      if (this.dbType === 'postgresql') {
        const result = await this.connection.query(sql, params);
        return result.rows;
      } else if (this.dbType === 'mysql') {
        const [rows] = await this.connection.execute(sql, params);
        return rows;
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      if (this.dbType === 'postgresql') {
        await this.connection.end();
      } else if (this.dbType === 'mysql') {
        await this.connection.end();
      }
      console.log('Database connection closed');
    }
  }
}

module.exports = new DatabaseConnection();

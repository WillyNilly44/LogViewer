const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const sql = require('mssql');

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
      } else if (this.dbType === 'mssql') {
        this.connection = new sql.ConnectionPool({
          server: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT) || 1433,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          options: {
            encrypt: process.env.DB_SSL === 'true',
            trustServerCertificate: true,
            enableArithAbort: true,
            cryptoCredentialsDetails: {
              minVersion: 'TLSv1'
            }
          },
          pool: {
            max: 20,
            min: 0,
            idleTimeoutMillis: 30000,
          },
          connectionTimeout: 60000,
          requestTimeout: 60000,
        });

        await this.connection.connect();
        console.log('Connected to SQL Server database');
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
      } else if (this.dbType === 'mssql') {
        const request = this.connection.request();
        // Add parameters to the request
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
        const result = await request.query(sql);
        return result.recordset;
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
      } else if (this.dbType === 'mssql') {
        await this.connection.close();
      }
      console.log('Database connection closed');
    }
  }
}

module.exports = new DatabaseConnection();

/**
 * Database Connection Module
 * Manages MySQL database connection pool and query execution
 * The database name should match: project_tracker_mysql_db
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import mysql from 'mysql2/promise'
import './utils/loadEnv'

// Validate required environment variables
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    `Please check your .env file. The DB_NAME should be: project_tracker_mysql_db`
  )
}

// Validate database name matches expected value
// The migration script creates: project_tracker_mysql_db
const expectedDbName = 'project_tracker_mysql_db'
if (requiredEnvVars.DB_NAME && requiredEnvVars.DB_NAME !== expectedDbName) {
  // Log warning but don't fail - allow connection to proceed
  // User will get a clear error message if database doesn't exist
}

/**
 * Create MySQL connection pool
 * Uses connection pooling for better performance
 */
const pool = mysql.createPool({
  host: requiredEnvVars.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: requiredEnvVars.DB_USER,
  password: requiredEnvVars.DB_PASSWORD || '',
  database: requiredEnvVars.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

/**
 * Database query executor
 * Provides async/await interface for database queries
 */
export const db = {
  /**
   * Execute a SQL query with optional parameters
   * @param sql - SQL query string
   * @param params - Optional array of query parameters
   * @returns Query results
   */
  query: async (sql: string, params?: any[]) => {
    try {
      const [rows] = await pool.execute(sql, params)
      return rows
    } catch (error: any) {
      // Provide helpful error messages for common issues
      if (error.code === 'ER_BAD_DB_ERROR') {
        throw new Error(
          `Database '${requiredEnvVars.DB_NAME}' does not exist.\n` +
          `Please run the migration script to create the database: npm run migrate`
        )
      }
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error(
          `Access denied. Please check your database credentials in the .env file.`
        )
      }
      throw error
    }
  },
  /**
   * Get a connection from the pool
   * @returns MySQL connection
   */
  getConnection: () => pool.getConnection(),
}


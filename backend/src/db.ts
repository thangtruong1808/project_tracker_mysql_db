/**
 * Database Connection Module
 * Manages MySQL database connection pool and query execution
 * The database name should match: project_tracker_mysql_db
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import mysql from 'mysql2/promise'
import './utils/loadEnv'

let pool: mysql.Pool | null = null

/**
 * Get or create MySQL connection pool
 * Lazy initialization to avoid errors at module load time
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns MySQL connection pool
 */
function getPool(): mysql.Pool {
  if (pool) return pool

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

  // Create MySQL connection pool with timeout and SSL configuration
  // FreeSQLDatabase requires SSL connections with rejectUnauthorized: false
  const poolConfig: mysql.PoolOptions = {
    host: requiredEnvVars.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: requiredEnvVars.DB_USER,
    password: requiredEnvVars.DB_PASSWORD || '',
    database: requiredEnvVars.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 180000, // 180 seconds connection timeout for remote databases (Render free tier may be slower)
    enableKeepAlive: true, // Keep connection alive
    keepAliveInitialDelay: 0, // Start keep-alive immediately
  }

  // SSL configuration - FreeSQLDatabase requires SSL with rejectUnauthorized: false
  // Default to SSL enabled unless explicitly disabled
  if (process.env.DB_SSL !== 'false') {
    // FreeSQLDatabase requires SSL but with rejectUnauthorized: false by default
    poolConfig.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    }
  }

  pool = mysql.createPool(poolConfig)

  return pool
}

/**
 * Database query executor
 * Provides async/await interface for database queries
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const db = {
  /**
   * Execute a SQL query with optional parameters
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @param sql - SQL query string
   * @param params - Optional array of query parameters
   * @returns Query results
   */
  query: async (sql: string, params?: any[]) => {
    try {
      const connectionPool = getPool()
      const [rows] = await connectionPool.execute(sql, params)
      return rows
    } catch (error: any) {
      // Provide helpful error messages for common issues
      if (error.code === 'ER_BAD_DB_ERROR') {
        throw new Error(
          `Database '${process.env.DB_NAME}' does not exist.\n` +
          `Please run the migration script to create the database: npm run migrate`
        )
      }
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error(
          `Access denied. Please check your database credentials in the .env file.`
        )
      }
      if (error.code === 'ETIMEDOUT' || error.errno === 'ETIMEDOUT') {
        throw new Error(
          `Database connection timeout. Please check:\n` +
          `1. Database host (${process.env.DB_HOST}) is correct and accessible\n` +
          `2. Database allows connections from Render's IP addresses\n` +
          `3. Firewall rules allow connections on port ${process.env.DB_PORT || 3306}\n` +
          `4. SSL configuration - FreeSQLDatabase requires SSL with rejectUnauthorized: false`
        )
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          `Database connection refused. Please check:\n` +
          `1. Database host (${process.env.DB_HOST}) and port (${process.env.DB_PORT || 3306}) are correct\n` +
          `2. Database server is running and accessible\n` +
          `3. Network connectivity from Render to database host`
        )
      }
      throw error
    }
  },
  /**
   * Get a connection from the pool
   *
   * @author Thang Truong
   * @date 2025-01-27
   * @returns MySQL connection
   */
  getConnection: () => getPool().getConnection(),
}


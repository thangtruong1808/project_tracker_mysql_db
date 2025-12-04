/**
 * Database Connection Module
 * Manages MySQL database connection pool and query execution
 * Supports Hostinger MySQL database configuration
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import mysql from 'mysql2/promise'
import './utils/loadEnv'

let pool: mysql.Pool | null = null

/**
 * Get or create MySQL connection pool
 * Lazy initialization to avoid errors at module load time
 *
 * @author Thang Truong
 * @date 2025-12-04
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
  // Reduced connection limit for FreeSQLDatabase free tier to avoid "host blocked" errors
  const poolConfig: mysql.PoolOptions = {
    host: requiredEnvVars.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: requiredEnvVars.DB_USER,
    password: requiredEnvVars.DB_PASSWORD || '',
    database: requiredEnvVars.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5, // Reduced from 10 to 5 for FreeSQLDatabase free tier limits
    queueLimit: 10, // Allow queuing requests when pool is full
    connectTimeout: 30000, // 30 seconds - reduced from 180s to avoid long waits
    enableKeepAlive: true, // Keep connection alive
    keepAliveInitialDelay: 0, // Start keep-alive immediately
  }

  // SSL configuration for FreeSQLDatabase
  // FreeSQLDatabase may or may not require SSL - try with SSL first, fallback to no SSL if needed
  const dbSsl = process.env.DB_SSL
  const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED
  
  // Only configure SSL if explicitly enabled or not disabled
  // If DB_SSL is not set or is 'true', enable SSL with rejectUnauthorized: false for FreeSQLDatabase
  if (dbSsl !== 'false') {
    // Default to rejectUnauthorized: false for FreeSQLDatabase compatibility
    const rejectUnauthorized = dbSslRejectUnauthorized === 'true'
    
    // Configure SSL - FreeSQLDatabase typically needs rejectUnauthorized: false
    poolConfig.ssl = {
      rejectUnauthorized: rejectUnauthorized,
    }
  }
  // If DB_SSL is explicitly 'false', SSL is not configured (mysql2 will not use SSL)

  pool = mysql.createPool(poolConfig)

  return pool
}

/**
 * Database query executor
 * Provides async/await interface for database queries
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
export const db = {
  /**
   * Execute a SQL query with optional parameters
   *
   * @author Thang Truong
   * @date 2025-12-04
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
          `2. Database allows connections from your IP address\n` +
          `3. Firewall rules allow connections on port ${process.env.DB_PORT || 3306}\n` +
          `4. SSL configuration - FreeSQLDatabase requires SSL with rejectUnauthorized: false`
        )
      }
      if (error.code === 'ER_NOT_SUPPORTED_AUTH_MODE' || error.message?.includes('does not support secure connection')) {
        throw new Error(
          `SSL connection error. The database server may not support SSL connections.\n` +
          `Try setting DB_SSL=false in your .env file to disable SSL.\n` +
          `If SSL is required, ensure DB_SSL_REJECT_UNAUTHORIZED=false is set.`
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
      if (error.code === 'ER_HOST_NOT_PRIVILEGED' || error.message?.includes('is blocked')) {
        throw new Error(
          `Database host is blocked due to too many connection errors.\n` +
          `This usually happens when:\n` +
          `1. Too many failed connection attempts\n` +
          `2. Connection pool is too large for free tier database\n` +
          `3. Connections are not being properly closed\n\n` +
          `Solution: Wait a few minutes and restart the server. The connection pool has been reduced to prevent this.`
        )
      }
      throw error
    }
  },
  /**
   * Get a connection from the pool
   *
   * @author Thang Truong
   * @date 2025-12-04
   * @returns MySQL connection
   */
  getConnection: () => getPool().getConnection(),
}


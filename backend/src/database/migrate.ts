/**
 * Database Migration Script
 * Creates database schema and tables for Project Tracker
 * Supports FreeSQLDatabase with SSL configuration
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

/**
 * Load environment variables from multiple possible locations
 * Checks root directory, backend directory, and default location
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
// Load environment variables - try multiple locations
const envPaths = [
  path.resolve(process.cwd(), '.env'),           // Current directory (backend/.env)
  path.resolve(process.cwd(), '../.env'),        // Parent directory (root/.env)
  path.resolve(__dirname, '../../../.env'),      // From source file location
]

let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  dotenv.config()
}

/**
 * Run database migration
 * Creates database and all required tables
 * Supports FreeSQLDatabase with SSL configuration
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
async function runMigration(): Promise<void> {
  // Validate environment variables
  const dbHost = process.env.DB_HOST
  const dbUser = process.env.DB_USER
  const dbPassword = process.env.DB_PASSWORD
  const dbName = process.env.DB_NAME

  if (!dbHost || !dbUser || !dbPassword) {
    process.stderr.write('❌ Missing required environment variables!\n')
    process.stderr.write('Required: DB_HOST, DB_USER, DB_PASSWORD\n')
    process.stderr.write(`Found: DB_HOST=${dbHost ? '✓' : '✗'}, DB_USER=${dbUser ? '✓' : '✗'}, DB_PASSWORD=${dbPassword ? '✓' : '✗'}\n`)
    process.stderr.write('\nPlease check your .env file in the project root or backend directory.\n')
    process.stderr.write('For FreeSQLDatabase, also set: DB_SSL_REJECT_UNAUTHORIZED=false\n')
    process.exit(1)
  }

  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306

  /**
   * Create database connection with SSL configuration for FreeSQLDatabase
   * FreeSQLDatabase requires SSL with rejectUnauthorized: false
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const connectionConfig: any = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true, // Allow multiple SQL statements
  }

  // SSL configuration for FreeSQLDatabase
  // FreeSQLDatabase may or may not require SSL - configure based on environment variables
  const dbSsl = process.env.DB_SSL
  const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED
  
  // Only configure SSL if explicitly enabled or not disabled
  if (dbSsl !== 'false') {
    // Default to rejectUnauthorized: false for FreeSQLDatabase compatibility
    const rejectUnauthorized = dbSslRejectUnauthorized === 'true'
    connectionConfig.ssl = {
      rejectUnauthorized: rejectUnauthorized,
    }
  }
  // If DB_SSL is explicitly 'false', SSL is not configured (mysql2 will not use SSL)

  const connection = await mysql.createConnection(connectionConfig)

  try {
    process.stdout.write('📦 Starting database migration...\n')
    process.stdout.write(`   Connecting to: ${dbHost}:${dbPort}\n`)
    process.stdout.write(`   Database: ${dbName || 'will be created'}\n`)

    const migrationPath = path.join(
      __dirname,
      'migrations',
      '001_create_projects_table.sql'
    )

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`)
    }

    const sql = fs.readFileSync(migrationPath, 'utf8')
    process.stdout.write('   Executing migration SQL...\n')

    await connection.query(sql)

    process.stdout.write('✅ Migration completed successfully!\n')
    process.stdout.write('   Database and tables have been created.\n')
  } catch (error: any) {
    process.stderr.write(`❌ Migration failed: ${error.message}\n`)
    if (error.code) {
      process.stderr.write(`   Error code: ${error.code}\n`)
    }
    if (error.sql) {
      process.stderr.write(`   SQL Error: ${error.sql}\n`)
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      process.stderr.write('\n💡 Tip: Check your database credentials in .env file\n')
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      process.stderr.write('\n💡 Tip: For FreeSQLDatabase, ensure:\n')
      process.stderr.write('   1. Database host is accessible from your network\n')
      process.stderr.write('   2. If SSL error, try setting DB_SSL=false in .env file\n')
    }
    if (error.code === 'ER_NOT_SUPPORTED_AUTH_MODE' || error.message?.includes('does not support secure connection')) {
      process.stderr.write('\n💡 Tip: SSL connection error. Try:\n')
      process.stderr.write('   1. Set DB_SSL=false in your .env file to disable SSL\n')
      process.stderr.write('   2. Or ensure DB_SSL_REJECT_UNAUTHORIZED=false is set if SSL is required\n')
    }
    process.exit(1)
  } finally {
    await connection.end()
  }
}

runMigration()


/**
 * Database Connection Test
 * Tests database connection on startup with retry logic
 * Non-blocking - server starts even if connection is slow
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { db } from '../db'
import { ensureActivityLogTargetUsers } from '../utils/activityLogMaintenance'

/**
 * Test database connection on startup with retry logic
 * Hostinger databases may need multiple connection attempts
 * Extended timeout for Render free tier which may have slower network
 * Server starts even if DB connection is slow (non-blocking)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const testDatabaseConnection = async (): Promise<void> => {
  const maxRetries = 10
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test database connection with extended timeout for remote databases
      // Increased to 180 seconds to account for Render free tier network delays
      const connectionTest = Promise.race([
        db.query('SELECT 1'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection test timeout after 180 seconds')), 180000)
        )
      ])
      
      await connectionTest
      await ensureActivityLogTargetUsers()
      // Database connection successful
      console.log('Database connection established successfully')
      return
    } catch (error: any) {
      lastError = error
      const errorMessage = error?.message || 'Unknown database connection error'
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff with longer delays)
        const waitTime = attempt * 5000 // 5s, 10s, 15s, 20s, etc.
        console.error(`Database connection attempt ${attempt} failed. Retrying in ${waitTime}ms...`)
        console.error('Error:', errorMessage)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        // Final attempt failed - log error but don't crash server
        // Server will continue running and retry on next request
        console.error(`Database connection failed after ${maxRetries} attempts:`)
        console.error('Error message:', errorMessage)
        if (error?.code) {
          console.error('Error code:', error.code)
        }
        if (error?.errno) {
          console.error('Error number:', error.errno)
        }
        if (error?.sqlState) {
          console.error('SQL State:', error.sqlState)
        }
        console.error('\nTroubleshooting steps:')
        console.error('1. Verify database credentials in Render environment variables')
        console.error('2. Check if Hostinger database allows external connections (Remote MySQL with % host)')
        console.error('3. Try setting DB_SSL_REJECT_UNAUTHORIZED=false in environment variables')
        console.error('4. Verify database host IP (82.180.142.51) and port (3306) are correct')
        console.error('5. Check if Hostinger firewall allows connections from Render IPs')
        console.error('6. Render free tier may have network restrictions - consider upgrading')
        console.error('\nServer is running but database connection failed. It will retry on next request.')
      }
    }
  }
}


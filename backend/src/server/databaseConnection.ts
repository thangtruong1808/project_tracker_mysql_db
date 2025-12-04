/**
 * Database Connection Test
 * Tests database connection on startup with retry logic
 * Non-blocking - server starts even if connection is slow
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { db } from '../db'
import { ensureActivityLogTargetUsers } from '../utils/activityLogMaintenance'

/**
 * Test database connection on startup with retry logic
 * FreeSQLDatabase may need connection attempts but with limited retries to avoid blocking
 * Server starts even if DB connection is slow (non-blocking)
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
export const testDatabaseConnection = async (): Promise<void> => {
  // Reduced retries to avoid triggering "host blocked" error on FreeSQLDatabase
  const maxRetries = 3
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test database connection with reasonable timeout
      // Reduced timeout to avoid long waits that could trigger blocking
      const connectionTest = Promise.race([
        db.query('SELECT 1'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection test timeout after 30 seconds')), 30000)
        )
      ])
      
      await connectionTest
      await ensureActivityLogTargetUsers()
      // Database connection successful - no console.log per requirements
      return
    } catch (error: any) {
      lastError = error
      const errorMessage = error?.message || 'Unknown database connection error'
      
      // Don't retry if host is blocked - wait longer or skip
      if (error.code === 'ER_HOST_NOT_PRIVILEGED' || error.message?.includes('is blocked')) {
        // Host is blocked - don't retry immediately, let it recover
        return
      }
      
      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        // Increased delays to avoid triggering blocking
        const waitTime = attempt * 10000 // 10s, 20s, 30s
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        // Final attempt failed - server will continue running and retry on next request
        // Error logging removed per requirements (only index.ts can have console.log)
      }
    }
  }
}


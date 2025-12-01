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
      // Database connection successful - no console.log per requirements
      return
    } catch (error: any) {
      lastError = error
      const errorMessage = error?.message || 'Unknown database connection error'
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff with longer delays)
        const waitTime = attempt * 5000 // 5s, 10s, 15s, 20s, etc.
        // Error logging removed per requirements (only index.ts can have console.log)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        // Final attempt failed - server will continue running and retry on next request
        // Error logging removed per requirements (only index.ts can have console.log)
      }
    }
  }
}


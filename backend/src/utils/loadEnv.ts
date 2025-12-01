/**
 * Environment Variable Loader Utility
 * Loads .env file from multiple possible locations
 * Checks root directory, backend directory, and default location
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

/**
 * Load environment variables from .env file
 * Checks multiple possible locations for the .env file
 * This ensures the .env file is found whether running from root or backend directory
 */
export const loadEnv = () => {
  // Get current working directory and source file directory
  const cwd = process.cwd()
  const sourceDir = __dirname

  // Calculate root directory from source file location
  // backend/src/utils/ -> ../../../ -> root directory
  const rootDir = path.resolve(sourceDir, '../../../')

  // Calculate root from current working directory (if cwd contains 'backend')
  const rootFromCwd = cwd.includes('backend') 
    ? path.resolve(cwd, '..') 
    : cwd

  // Possible .env file locations (in order of preference)
  const envPaths = [
    path.resolve(rootDir, '.env'),                  // Root directory .env (from source location)
    path.resolve(rootFromCwd, '.env'),              // Root directory .env (from cwd)
    path.resolve(cwd, '.env'),                      // Current working directory .env
    path.resolve(rootDir, 'backend/.env'),          // Backend directory .env
    path.resolve(cwd, 'backend/.env'),              // Backend/.env from cwd
    path.resolve(cwd, '../.env'),                   // Parent directory .env
  ]

  // Remove duplicate paths and normalize them
  const uniquePaths = Array.from(
    new Set(envPaths.map(p => path.normalize(p)))
  ).filter(p => p && p !== '.')

  // Try each path until one is found
  for (const envPath of uniquePaths) {
    try {
      if (fs.existsSync(envPath) && fs.statSync(envPath).isFile()) {
        dotenv.config({ path: envPath })
        return
      }
    } catch {
      // Continue to next path if current one fails
      continue
    }
  }

  // If no .env file found, try default location (current directory)
  dotenv.config()
}

// Load environment variables immediately when this module is imported
loadEnv()

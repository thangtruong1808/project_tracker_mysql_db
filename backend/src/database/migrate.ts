import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

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

async function runMigration() {
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
    process.exit(1)
  }

  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true, // Allow multiple SQL statements
  })

  try {
    const migrationPath = path.join(
      __dirname,
      'migrations',
      '001_create_projects_table.sql'
    )
    const sql = fs.readFileSync(migrationPath, 'utf8')

    await connection.query(sql)
  } catch (error: any) {
    process.stderr.write(`❌ Migration failed: ${error.message}\n`)
    if (error.sql) {
      process.stderr.write(`SQL Error: ${error.sql}\n`)
    }
    process.exit(1)
  } finally {
    await connection.end()
  }
}

runMigration()


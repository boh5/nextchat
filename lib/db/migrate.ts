import dotenv from 'dotenv'
import path from 'path'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { pool, db } from './drizzle'

dotenv.config()

async function main() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'lib/db/migrations') })
  console.log('Migrations applied successfully')
  await pool.end()
}

main()

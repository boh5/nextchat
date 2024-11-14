import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export const pool = postgres(process.env.POSTGRES_URL!, {max: 1})
export const db = drizzle(pool, { schema })
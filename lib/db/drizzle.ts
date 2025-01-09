import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// TODO: 改用 t3-env
// biome-ignore lint/style/noNonNullAssertion: 后面改用 t3-env
const pool = postgres(process.env.DATABASE_URL!, { max: 1 });

export const db = drizzle(pool);

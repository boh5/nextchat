import { env } from '@/env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema',
  out: './lib/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});

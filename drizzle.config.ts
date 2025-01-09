import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    // TODO: 改用 t3-env
    // biome-ignore lint/style/noNonNullAssertion: 后面改用 t3-env
    url: process.env.DATABASE_URL!,
  },
});


import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
export default defineConfig({
  schema: './src/drizzle/schema/**.schema.ts',
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: {
    url:process.env.DB_URL
  },
});

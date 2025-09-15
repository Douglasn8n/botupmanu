import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required to initialize the database pool.');
}

export const pool = new Pool({
  connectionString,
  // Neon requires SSL connections; the connection string already encodes this via sslmode.
  // Additional configuration can be added here if necessary.
});

export default pool;

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.warn('No migration files found.');
    return;
  }

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = await readFile(filePath, 'utf8');

    if (!sql.trim()) {
      console.warn(`Skipping empty migration file: ${file}`);
      continue;
    }

    console.log(`\nRunning migration: ${file}`);
    await pool.query(sql);
    console.log(`Migration ${file} completed.`);
  }
}

runMigrations()
  .then(() => {
    console.log('\nAll migrations executed successfully.');
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

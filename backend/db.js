import initSqlJs from 'sql.js'
import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATABASE_FILE = path.join(__dirname, 'data.sqlite')

const sql = await initSqlJs({
  locateFile: (file) => path.resolve(__dirname, '../node_modules/sql.js/dist', file)
})

const database = fs.existsSync(DATABASE_FILE)
  ? new sql.Database(fs.readFileSync(DATABASE_FILE))
  : new sql.Database()

database.run(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

database.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

persistDatabase()

function persistDatabase() {
  const data = database.export()
  fs.writeFileSync(DATABASE_FILE, Buffer.from(data))
}

export function run(query, params = []) {
  database.run(query, params)
  persistDatabase()
}

export function insert(query, params = []) {
  database.run(query, params)
  const [result] = database.exec('SELECT last_insert_rowid() as id;')
  persistDatabase()
  const insertedId = result?.values?.[0]?.[0]
  return typeof insertedId === 'number' ? insertedId : null
}

export function get(query, params = []) {
  const statement = database.prepare(query)
  try {
    statement.bind(params)
    if (statement.step()) {
      return statement.getAsObject()
    }
    return null
  } finally {
    statement.free()
  }
}

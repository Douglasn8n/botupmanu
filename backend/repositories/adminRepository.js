import { get, insert } from '../db.js'

export function insertAdmin({ username, name, passwordHash }) {
  return insert(
    `INSERT INTO admins (username, name, password_hash) VALUES (?, ?, ?);`,
    [username, name, passwordHash]
  )
}

export function findAdminByUsername(username) {
  return get(
    `SELECT id, username, name, password_hash, created_at FROM admins WHERE username = ?;`,
    [username]
  )
}

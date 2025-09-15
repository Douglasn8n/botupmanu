import { get, insert } from '../db.js'

export function insertUser({ username, name, passwordHash }) {
  return insert(
    `INSERT INTO users (username, name, password_hash) VALUES (?, ?, ?);`,
    [username, name, passwordHash]
  )
}

export function findUserByUsername(username) {
  return get(
    `SELECT id, username, name, password_hash, created_at FROM users WHERE username = ?;`,
    [username]
  )
}

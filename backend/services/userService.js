import bcrypt from 'bcryptjs'
import { findUserByUsername, insertUser } from '../repositories/userRepository.js'

const SALT_ROUNDS = 12

function sanitizeUserRow(row) {
  if (!row) return null
  const { id, username, name, created_at: createdAt } = row
  return { id, username, name, createdAt }
}

export function createUser({ username, password, name }) {
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS)
  insertUser({ username, name, passwordHash })
  return sanitizeUserRow(findUserByUsername(username))
}

export function findUserForAuthentication(username) {
  return findUserByUsername(username)
}

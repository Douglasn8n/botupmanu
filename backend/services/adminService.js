import bcrypt from 'bcryptjs'
import { findAdminByUsername, insertAdmin } from '../repositories/adminRepository.js'

const SALT_ROUNDS = 12

function sanitizeAdminRow(row) {
  if (!row) return null
  const { id, username, name, created_at: createdAt } = row
  return { id, username, name, createdAt }
}

export function createAdmin({ username, password, name }) {
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS)
  insertAdmin({ username, name, passwordHash })
  return sanitizeAdminRow(findAdminByUsername(username))
}

export function ensureAdmin({ username, password, name }) {
  const existing = findAdminByUsername(username)
  if (existing) {
    return sanitizeAdminRow(existing)
  }
  return createAdmin({ username, password, name })
}

export function findAdminForAuthentication(username) {
  return findAdminByUsername(username)
}

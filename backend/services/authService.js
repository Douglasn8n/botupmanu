import bcrypt from 'bcryptjs'
import { findAdminForAuthentication } from './adminService.js'
import { findUserForAuthentication } from './userService.js'

function sanitizeAuthenticatedAccount(row, role) {
  if (!row) return null
  const { id, username, name, created_at: createdAt } = row
  return { id, username, name, createdAt, role }
}

function verifyPassword(row, password) {
  if (!row) return null
  const isValid = bcrypt.compareSync(password, row.password_hash)
  return isValid ? row : null
}

function authenticateAdmin(username, password) {
  const adminRow = findAdminForAuthentication(username)
  const validAdmin = verifyPassword(adminRow, password)
  return sanitizeAuthenticatedAccount(validAdmin, 'admin')
}

function authenticateUser(username, password) {
  const userRow = findUserForAuthentication(username)
  const validUser = verifyPassword(userRow, password)
  return sanitizeAuthenticatedAccount(validUser, 'user')
}

export function authenticate({ username, password, role }) {
  if (!username || !password) {
    return null
  }

  if (role === 'admin') {
    return authenticateAdmin(username, password)
  }

  if (role === 'user') {
    return authenticateUser(username, password)
  }

  return authenticateAdmin(username, password) ?? authenticateUser(username, password)
}

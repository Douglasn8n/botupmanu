import process from 'node:process'
import { ensureAdmin } from './services/adminService.js'

const DEFAULT_ADMIN = {
  username: process.env.DEFAULT_ADMIN_USERNAME ?? 'admin',
  password: process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123456',
  name: process.env.DEFAULT_ADMIN_NAME ?? 'Administrador Padrão'
}

try {
  const admin = ensureAdmin(DEFAULT_ADMIN)
  console.log(`Administrador padrão disponível: ${admin.username}`)
} catch (error) {
  console.error('Não foi possível criar o administrador padrão.', error)
  process.exitCode = 1
}

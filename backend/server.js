import express from 'express'
import cors from 'cors'
import process from 'node:process'
import { authenticate } from './services/authService.js'
import { createAdmin } from './services/adminService.js'
import { createUser } from './services/userService.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.post('/api/admins', (req, res) => {
  const { username, password, name } = req.body ?? {}

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'username, password e name são obrigatórios.' })
  }

  try {
    const admin = createAdmin({ username, password, name })
    return res.status(201).json({ admin })
  } catch (error) {
    if (typeof error?.message === 'string' && error.message.includes('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ message: 'Nome de usuário já está em uso.' })
    }

    console.error('Erro ao criar admin:', error)
    return res.status(500).json({ message: 'Não foi possível criar o admin.' })
  }
})

app.post('/api/users', (req, res) => {
  const { username, password, name } = req.body ?? {}

  if (!username || !password || !name) {
    return res.status(400).json({ message: 'username, password e name são obrigatórios.' })
  }

  try {
    const user = createUser({ username, password, name })
    return res.status(201).json({ user })
  } catch (error) {
    if (typeof error?.message === 'string' && error.message.includes('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ message: 'Nome de usuário já está em uso.' })
    }

    console.error('Erro ao criar usuário:', error)
    return res.status(500).json({ message: 'Não foi possível criar o usuário.' })
  }
})

app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({ message: 'username e password são obrigatórios.' })
  }

  const result = authenticate({ username, password, role })

  if (!result) {
    return res.status(401).json({ message: 'Credenciais inválidas.' })
  }

  return res.json({ account: result })
})

app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`)
})

import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

dotenv.config()

const app = express()
app.use(express.json())

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
}

if (!poolConfig.connectionString) {
  poolConfig.host = process.env.PGHOST ?? 'localhost'
  poolConfig.port = process.env.PGPORT ? Number(process.env.PGPORT) : 5432
  poolConfig.user = process.env.PGUSER
  poolConfig.password = process.env.PGPASSWORD
  poolConfig.database = process.env.PGDATABASE
}

if (process.env.PGSSLMODE === 'require') {
  poolConfig.ssl = { rejectUnauthorized: false }
}

if (process.env.PGPOOL_MAX) {
  poolConfig.max = Number(process.env.PGPOOL_MAX)
}

const pool = new Pool(poolConfig)

const JWT_SECRET = process.env.JWT_SECRET

const sendSuccess = (res, data, status = 200) => {
  res.status(status).json({ success: true, data })
}

const sendClientError = (res, message, details) => {
  res.status(400).json({ success: false, error: { message, details } })
}

const sendServerError = (res, error) => {
  console.error('[api] erro inesperado', error)
  res
    .status(500)
    .json({ success: false, error: { message: 'Erro interno do servidor' } })
}

const authenticate = (req, res, next) => {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return sendClientError(
      res,
      'Token de autenticação ausente ou inválido.',
    )
  }

  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado')
    }

    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (error) {
    sendClientError(res, 'Token inválido.', { reason: error.message })
  }
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return sendClientError(res, 'Email e senha são obrigatórios.')
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password, password_hash FROM users WHERE email = $1 LIMIT 1',
      [email],
    )

    if (!rows.length) {
      return sendClientError(res, 'Credenciais inválidas.')
    }

    const user = rows[0]
    const storedPassword = user.password_hash ?? user.password

    if (storedPassword && storedPassword !== password) {
      return sendClientError(res, 'Credenciais inválidas.')
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado')
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    })

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    sendServerError(res, error)
  }
})

app.get('/companies', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, document, created_at FROM companies ORDER BY id DESC',
    )
    sendSuccess(res, rows)
  } catch (error) {
    sendServerError(res, error)
  }
})

app.post('/companies', authenticate, async (req, res) => {
  const { name, document } = req.body ?? {}

  if (!name) {
    return sendClientError(res, 'Nome da empresa é obrigatório.')
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO companies (name, document) VALUES ($1, $2) RETURNING id, name, document, created_at',
      [name, document ?? null],
    )

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.put('/companies/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para atualização de empresa.')
  }

  const { name, document } = req.body ?? {}

  if (name == null && document == null) {
    return sendClientError(res, 'Informe ao menos um campo para atualizar.')
  }

  try {
    const { rows } = await pool.query(
      'UPDATE companies SET name = COALESCE($2, name), document = COALESCE($3, document) WHERE id = $1 RETURNING id, name, document, created_at',
      [id, name ?? null, document ?? null],
    )

    if (!rows.length) {
      return sendClientError(res, 'Empresa não encontrada para atualização.')
    }

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.delete('/companies/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para exclusão de empresa.')
  }

  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1', [id])

    if (!result.rowCount) {
      return sendClientError(res, 'Empresa não encontrada para exclusão.')
    }

    sendSuccess(res, { id })
  } catch (error) {
    sendServerError(res, error)
  }
})

app.get('/users', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC',
    )
    sendSuccess(res, rows)
  } catch (error) {
    sendServerError(res, error)
  }
})

app.post('/users', authenticate, async (req, res) => {
  const { name, email, password, role } = req.body ?? {}

  if (!name || !email) {
    return sendClientError(res, 'Nome e email são obrigatórios.')
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password ?? null, role ?? null],
    )

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.put('/users/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para atualização de usuário.')
  }

  const { name, email, password, role } = req.body ?? {}

  if (name == null && email == null && password == null && role == null) {
    return sendClientError(res, 'Informe ao menos um campo para atualizar.')
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email), password = COALESCE($4, password), role = COALESCE($5, role) WHERE id = $1 RETURNING id, name, email, role, created_at',
      [id, name ?? null, email ?? null, password ?? null, role ?? null],
    )

    if (!rows.length) {
      return sendClientError(res, 'Usuário não encontrado para atualização.')
    }

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.delete('/users/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para exclusão de usuário.')
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id])

    if (!result.rowCount) {
      return sendClientError(res, 'Usuário não encontrado para exclusão.')
    }

    sendSuccess(res, { id })
  } catch (error) {
    sendServerError(res, error)
  }
})

app.get('/demands', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description, status, company_id, user_id, created_at FROM demands ORDER BY created_at DESC',
    )
    sendSuccess(res, rows)
  } catch (error) {
    sendServerError(res, error)
  }
})

app.post('/demands', authenticate, async (req, res) => {
  const { title, description, status, companyId, userId } = req.body ?? {}

  if (!title || !status) {
    return sendClientError(res, 'Título e status da demanda são obrigatórios.')
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO demands (title, description, status, company_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, status, company_id, user_id, created_at',
      [title, description ?? null, status, companyId ?? null, userId ?? null],
    )

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.put('/demands/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para atualização de demanda.')
  }

  const { title, description, status, companyId, userId } = req.body ?? {}

  if (
    title == null &&
    description == null &&
    status == null &&
    companyId == null &&
    userId == null
  ) {
    return sendClientError(res, 'Informe ao menos um campo para atualizar.')
  }

  try {
    const { rows } = await pool.query(
      'UPDATE demands SET title = COALESCE($2, title), description = COALESCE($3, description), status = COALESCE($4, status), company_id = COALESCE($5, company_id), user_id = COALESCE($6, user_id) WHERE id = $1 RETURNING id, title, description, status, company_id, user_id, created_at',
      [
        id,
        title ?? null,
        description ?? null,
        status ?? null,
        companyId ?? null,
        userId ?? null,
      ],
    )

    if (!rows.length) {
      return sendClientError(res, 'Demanda não encontrada para atualização.')
    }

    sendSuccess(res, rows[0])
  } catch (error) {
    sendServerError(res, error)
  }
})

app.delete('/demands/:id', authenticate, async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)

  if (Number.isNaN(id)) {
    return sendClientError(res, 'ID inválido para exclusão de demanda.')
  }

  try {
    const result = await pool.query('DELETE FROM demands WHERE id = $1', [id])

    if (!result.rowCount) {
      return sendClientError(res, 'Demanda não encontrada para exclusão.')
    }

    sendSuccess(res, { id })
  } catch (error) {
    sendServerError(res, error)
  }
})

app.use((req, res) => {
  sendClientError(res, 'Rota não encontrada.')
})

const isLocalExecution =
  !process.env.VERCEL &&
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test'

if (isLocalExecution) {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001
  app.listen(port, () => {
    console.log(`API executando na porta ${port}`)
  })
}

export default app

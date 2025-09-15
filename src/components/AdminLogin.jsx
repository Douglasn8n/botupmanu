import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { useApi } from '@/hooks/use-api.js'
import { Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

const resolveToken = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  if ('token' in payload && payload.token) {
    return payload.token
  }

  if ('accessToken' in payload && payload.accessToken) {
    return payload.accessToken
  }

  if ('access_token' in payload && payload.access_token) {
    return payload.access_token
  }

  if ('data' in payload && payload.data) {
    return resolveToken(payload.data)
  }

  return undefined
}

const resolveAdmin = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  if ('admin' in payload && payload.admin) {
    return payload.admin
  }

  if ('user' in payload && payload.user) {
    return payload.user
  }

  if ('data' in payload && payload.data) {
    return resolveAdmin(payload.data)
  }

  return payload
}

const DEFAULT_LOGIN_ROUTE = 'admin/login'

const getFeedbackColor = (type) => {
  if (type === 'success') {
    return 'text-green-600'
  }

  if (type === 'error') {
    return 'text-red-600'
  }

  return 'text-muted-foreground'
}

const AdminLogin = ({ onLogin, loginRoute = DEFAULT_LOGIN_ROUTE }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState(null)
  const { request, loading, error, resetError } = useApi()

  useEffect(() => {
    if (error) {
      const message = error.message ?? 'Erro ao tentar realizar login.'
      toast.error(message)
      setFeedback({ type: 'error', message })
    }
  }, [error])

  const isSubmitDisabled = useMemo(() => {
    return loading || !email.trim() || !password.trim()
  }, [email, loading, password])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback(null)
    resetError()

    try {
      const payload = await request({
        endpoint: loginRoute,
        method: 'POST',
        data: {
          email: email.trim(),
          password: password.trim(),
          senha: password.trim()
        }
      })

      const token = resolveToken(payload)
      const admin = resolveAdmin(payload)

      if (!token) {
        throw new Error('A resposta do servidor não contém o token de autenticação.')
      }

      const successMessage = 'Login realizado com sucesso!'
      toast.success(successMessage)
      setFeedback({ type: 'success', message: successMessage })
      onLogin?.({ token, admin })
    } catch (submitError) {
      const message = submitError?.message ?? 'Não foi possível realizar o login.'
      toast.error(message)
      setFeedback({ type: 'error', message })
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
        <CardDescription>
          Utilize suas credenciais para gerenciar empresas, usuários e demandas da plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-muted-foreground" />
              E-mail institucional
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="admin@empresa.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (feedback) {
                  setFeedback(null)
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Senha de acesso
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (feedback) {
                  setFeedback(null)
                }
              }}
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitDisabled}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Entrar
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className={`text-sm ${getFeedbackColor(feedback?.type)}`}>
          {feedback?.message ?? 'Informe suas credenciais para iniciar a sessão de administração.'}
        </p>
      </CardFooter>
    </Card>
  )
}

export default AdminLogin

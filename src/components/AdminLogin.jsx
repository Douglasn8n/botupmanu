import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { AlertCircle, Lock, User } from 'lucide-react'

const AdminLogin = ({ onLogin, credentials }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedUser = username.trim()

    if (!trimmedUser || !password.trim()) {
      setError('Informe o usuário e a senha para continuar.')
      return
    }

    if (
      trimmedUser.toLowerCase() === credentials.username.toLowerCase() &&
      password === credentials.password
    ) {
      setError('')
      onLogin({
        name: credentials.name,
        username: credentials.username,
        role: 'admin'
      })
      setUsername('')
      setPassword('')
      return
    }

    setError('Usuário ou senha inválidos. Tente novamente.')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="inline-flex items-center space-x-3 text-primary">
            <div className="bg-primary/10 rounded-full p-3">
              <Lock className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium uppercase tracking-widest text-primary/80">
              Acesso Restrito
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Painel Administrativo
          </CardTitle>
          <CardDescription>
            Insira seu usuário e senha de administrador para acessar o painel de demandas e gerenciamento de empresas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Digite seu usuário"
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start space-x-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <p className="font-medium text-slate-700">Credenciais padrão para demonstração</p>
              <div className="mt-1 flex flex-col">
                <span><span className="font-semibold">Usuário:</span> {credentials.username}</span>
                <span><span className="font-semibold">Senha:</span> {credentials.password}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AdminLogin

import { useState } from 'react'
import AdminLogin from './components/AdminLogin.jsx'
import CompanyManagement from './components/CompanyManagement.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Toaster } from 'sonner'
import { LogOut, MessageSquare, User } from 'lucide-react'
import './App.css'

const App = () => {
  const [session, setSession] = useState(null)

  const handleLogin = (payload) => {
    setSession(payload)
  }

  const handleLogout = () => {
    setSession(null)
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Toaster richColors position="top-right" />
        <AdminLogin onLogin={handleLogin} />
      </div>
    )
  }

  const adminName = session.admin?.nome ?? session.admin?.name ?? 'Administrador'
  const adminEmail = session.admin?.email ?? session.admin?.mail ?? session.admin?.login ?? 'Acesso administrativo'

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Painel administrativo de demandas</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe empresas, usuários e demandas cadastradas na plataforma BotUp.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{adminName}</p>
              <p className="text-xs text-muted-foreground">{adminEmail}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white sm:h-12 sm:w-12">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 pb-10">
          <CompanyManagement token={session.token} admin={session.admin} />
        </main>
      </div>
    </div>
  )
}

export default App

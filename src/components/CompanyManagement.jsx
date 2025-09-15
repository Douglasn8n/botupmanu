import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx'
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  ShieldCheck,
  Users,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils.js'

const CompanyManagement = ({ companies, onCreateCompany, onCreateUser }) => {
  const [companyForm, setCompanyForm] = useState({ name: '', description: '' })
  const [companyError, setCompanyError] = useState('')
  const [userForms, setUserForms] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [copiedUserId, setCopiedUserId] = useState(null)

  const totalUsers = useMemo(() => companies.reduce((total, company) => total + company.users.length, 0), [companies])
  const lastCompany = useMemo(
    () => (companies.length > 0 ? companies[companies.length - 1] : null),
    [companies]
  )

  useEffect(() => {
    if (!feedback) return
    const timeout = setTimeout(() => setFeedback(null), 5000)
    return () => clearTimeout(timeout)
  }, [feedback])

  const handleCompanySubmit = (event) => {
    event.preventDefault()
    const trimmedName = companyForm.name.trim()
    const trimmedDescription = companyForm.description.trim()

    if (!trimmedName) {
      setCompanyError('Informe o nome da empresa para continuar.')
      return
    }

    onCreateCompany({
      name: trimmedName,
      description: trimmedDescription,
    })
    setCompanyForm({ name: '', description: '' })
    setCompanyError('')
    setFeedback({
      type: 'success',
      title: 'Empresa criada com sucesso',
      description: `A empresa "${trimmedName}" já está disponível para receber usuários.`,
    })
  }

  const handleUserInputChange = (companyId, field, value) => {
    setUserForms((previous) => ({
      ...previous,
      [companyId]: {
        ...previous[companyId],
        [field]: value,
      },
    }))
  }

  const handleCreateUser = (event, companyId) => {
    event.preventDefault()
    const formState = userForms[companyId] ?? { name: '', email: '' }
    const trimmedName = formState.name?.trim() ?? ''
    const trimmedEmail = formState.email?.trim() ?? ''

    if (!trimmedName) {
      setFeedback({
        type: 'error',
        title: 'Não foi possível criar o usuário',
        description: 'Informe o nome completo do colaborador para gerar as credenciais.',
      })
      return
    }

    const credentials = onCreateUser(companyId, {
      name: trimmedName,
      email: trimmedEmail,
    })

    if (!credentials) {
      setFeedback({
        type: 'error',
        title: 'Empresa não encontrada',
        description: 'Não conseguimos localizar a empresa selecionada. Tente novamente.',
      })
      return
    }

    setUserForms((previous) => ({
      ...previous,
      [companyId]: { name: '', email: '' },
    }))
    setFeedback({
      type: 'success',
      title: 'Usuário criado com sucesso',
      description: 'As credenciais foram geradas automaticamente. Compartilhe-as com o colaborador.',
      credentials,
    })
  }

  const handleCopyCredentials = async (user) => {
    try {
      await navigator.clipboard.writeText(`Usuário: ${user.username} | Senha: ${user.password}`)
      setCopiedUserId(user.id)
      setTimeout(() => setCopiedUserId(null), 2000)
    } catch {
      setFeedback({
        type: 'error',
        title: 'Falha ao copiar credenciais',
        description: 'Copie os dados manualmente. Seu navegador não permitiu o acesso à área de transferência.',
      })
    }
  }

  const renderFeedbackIcon = () => {
    if (!feedback) return null
    if (feedback.type === 'error') return <AlertCircle className="h-4 w-4 text-red-600" />
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas ativas</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{companies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Empresas disponíveis para cadastro de usuários.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários cadastrados</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de usuários vinculados às empresas.
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última empresa criada</CardTitle>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastCompany ? (
              <div className="space-y-1">
                <p className="text-base font-medium leading-none">{lastCompany.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastCompany.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cadastre sua primeira empresa para começar.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className="border">
          {renderFeedbackIcon()}
          <AlertTitle>{feedback.title}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{feedback.description}</p>
            {feedback.credentials && (
              <div className="grid gap-1 rounded-md bg-muted px-3 py-2 text-xs">
                <span className="font-medium text-muted-foreground/80">Credenciais geradas</span>
                <span className="font-mono text-sm text-foreground">Usuário: {feedback.credentials.username}</span>
                <span className="font-mono text-sm text-foreground">Senha: {feedback.credentials.password}</span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Cadastro de empresas</CardTitle>
              <CardDescription>
                Crie novas empresas para que seja possível gerar usuários e credenciais individualizadas.
              </CardDescription>
            </div>
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompanySubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Nome da empresa</Label>
              <Input
                id="company-name"
                value={companyForm.name}
                onChange={(event) => setCompanyForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))}
                placeholder="Ex.: Acme Telecom"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-description">Descrição ou observações</Label>
              <Textarea
                id="company-description"
                value={companyForm.description}
                onChange={(event) => setCompanyForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))}
                placeholder="Detalhes adicionais sobre a empresa ou regras de acesso."
                rows={3}
              />
            </div>
            {companyError && <p className="text-sm text-red-600">{companyError}</p>}
            <Button type="submit" className="w-fit">
              <Building2 className="mr-2 h-4 w-4" />
              Cadastrar empresa
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {companies.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Cadastre uma empresa para começar a gerenciar usuários e credenciais.
            </CardContent>
          </Card>
        ) : (
          companies.map((company) => {
            const formState = userForms[company.id] ?? { name: '', email: '' }
            return (
              <Card key={company.id}>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {company.name}
                      <Badge variant="secondary" className="capitalize">
                        {company.users.length} usuário{company.users.length === 1 ? '' : 's'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {company.description || 'Nenhuma descrição informada para esta empresa.'}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                      Criada em{' '}
                      {new Date(company.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">Gerar credenciais para um novo usuário</h4>
                    </div>
                    <form onSubmit={(event) => handleCreateUser(event, company.id)} className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor={`user-name-${company.id}`}>Nome completo</Label>
                        <Input
                          id={`user-name-${company.id}`}
                          value={formState.name}
                          onChange={(event) => handleUserInputChange(company.id, 'name', event.target.value)}
                          placeholder="Ex.: Maria Oliveira"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`user-email-${company.id}`}>E-mail (opcional)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id={`user-email-${company.id}`}
                            type="email"
                            value={formState.email ?? ''}
                            onChange={(event) => handleUserInputChange(company.id, 'email', event.target.value)}
                            placeholder="usuario@empresa.com"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <Button type="submit" className={cn('w-full sm:w-fit', 'lg:col-span-2')}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Gerar credenciais
                      </Button>
                    </form>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium">Usuários da empresa</h4>
                      <Badge variant="outline">{company.users.length}</Badge>
                    </div>
                    {company.users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ainda não há usuários cadastrados. Gere as credenciais acima para adicionar novos colaboradores.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Senha</TableHead>
                            <TableHead>Criado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell className="font-mono text-sm">{user.username}</TableCell>
                              <TableCell className="font-mono text-sm">{user.password}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyCredentials(user)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  {copiedUserId === user.id ? 'Copiado!' : 'Copiar'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CompanyManagement

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { useApi } from '@/hooks/use-api.js'
import DemandDetails from './DemandDetails.jsx'
import {
  Building2,
  Loader2,
  PlusCircle,
  Trash2,
  UserPlus2,
  Users2,
  MessageSquare,
  FilePlus2
} from 'lucide-react'
import { toast } from 'sonner'

const getCompanyId = (company) => company?.id ?? company?._id ?? company?.uuid ?? company?.companyId ?? company?.codigo

const getUserId = (user) => user?.id ?? user?._id ?? user?.uuid ?? user?.userId ?? user?.codigo

const getDemandId = (demand) => demand?.id ?? demand?._id ?? demand?.uuid ?? demand?.demandId ?? demand?.codigo

const getCompanyName = (company) => company?.nome ?? company?.name ?? 'Empresa sem nome'

const getCompanyDocument = (company) => company?.cnpj ?? company?.document ?? company?.identifier ?? 'Não informado'

const getCompanyDomain = (company) => company?.dominio ?? company?.domain ?? company?.url ?? 'Não informado'

const extractUsers = (company) => {
  if (!company) {
    return []
  }

  if (Array.isArray(company.usuarios)) {
    return company.usuarios
  }

  if (Array.isArray(company.users)) {
    return company.users
  }

  return []
}

const extractDemands = (company) => {
  if (!company) {
    return []
  }

  if (Array.isArray(company.demandas)) {
    return company.demandas
  }

  if (Array.isArray(company.demands)) {
    return company.demands
  }

  if (Array.isArray(company.demandasPendentes)) {
    return company.demandasPendentes
  }

  return []
}

const getUserName = (user) => user?.nome ?? user?.name ?? 'Usuário'

const getUserEmail = (user) => user?.email ?? user?.mail ?? 'Sem e-mail'

const getUserRole = (user) => user?.perfil ?? user?.role ?? user?.tipo ?? 'Usuário'

const getDemandTitle = (demand) => demand?.titulo ?? demand?.title ?? 'Demanda sem título'

const getDemandStatus = (demand) => demand?.status ?? demand?.situacao ?? 'indefinido'

const getDemandPriority = (demand) => demand?.prioridade ?? demand?.priority ?? 'não informado'

const getDemandType = (demand) => demand?.tipo ?? demand?.type ?? 'geral'

const DEMAND_PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
]

const DEMAND_STATUS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em-analise', label: 'Em análise' },
  { value: 'em-desenvolvimento', label: 'Em desenvolvimento' },
  { value: 'aguardando-feedback', label: 'Aguardando feedback' },
  { value: 'concluido', label: 'Concluído' }
]

const DEMAND_TYPES = [
  { value: 'nova-funcionalidade', label: 'Nova funcionalidade' },
  { value: 'correcao-erro', label: 'Correção de erro' },
  { value: 'alteracao', label: 'Alteração' },
  { value: 'otimizacao', label: 'Otimização' }
]

const INITIAL_DEMAND_FORM = {
  titulo: '',
  descricao: '',
  tipo: DEMAND_TYPES[0].value,
  prioridade: DEMAND_PRIORITIES[1].value,
  status: DEMAND_STATUS[0].value,
  cliente: '',
  chatbot: ''
}

const CompanyManagement = ({ token, admin }) => {
  const { request: requestCompanies, loading: loadingCompanies } = useApi({ token })
  const { request: requestCompanyDetails, loading: loadingCompanyDetails } = useApi({ token })
  const { request: createCompanyRequest, loading: creatingCompany } = useApi({ token })
  const { request: deleteCompanyRequest, loading: deletingCompany } = useApi({ token })
  const { request: userRequest, loading: updatingUsers } = useApi({ token })
  const { request: demandRequest, loading: updatingDemands } = useApi({ token })

  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedDemandId, setSelectedDemandId] = useState(null)
  const [demandForm, setDemandForm] = useState(INITIAL_DEMAND_FORM)

  const updateCompaniesList = useCallback((companyData) => {
    if (!companyData) {
      return
    }

    const companyId = getCompanyId(companyData)
    if (!companyId) {
      return
    }

    setCompanies((previousCompanies) => {
      const currentList = Array.isArray(previousCompanies) ? previousCompanies : []
      const exists = currentList.some((company) => getCompanyId(company) === companyId)
      if (exists) {
        return currentList.map((company) =>
          getCompanyId(company) === companyId ? { ...company, ...companyData } : company
        )
      }
      return [...currentList, companyData]
    })
  }, [])

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await requestCompanies({ endpoint: 'admin/companies', method: 'GET' })
      const companyList = Array.isArray(response) ? response : response?.companies ?? []
      setCompanies(companyList)
      return companyList
    } catch (error) {
      toast.error(error?.message ?? 'Erro ao carregar empresas cadastradas.')
      return []
    }
  }, [requestCompanies])

  const fetchCompanyDetails = useCallback(async (companyId) => {
    if (!companyId) {
      setSelectedCompany(null)
      return null
    }

    try {
      const response = await requestCompanyDetails({
        endpoint: `admin/companies/${companyId}`,
        method: 'GET'
      })
      const companyData = response?.company ?? response
      updateCompaniesList(companyData)
      setSelectedCompany(companyData)
      return companyData
    } catch (error) {
      toast.error(error?.message ?? 'Erro ao carregar detalhes da empresa selecionada.')
      return null
    }
  }, [requestCompanyDetails, updateCompaniesList])

  useEffect(() => {
    if (!token) {
      return
    }

    let ignore = false

    fetchCompanies().then((companyList) => {
      if (!ignore && companyList.length > 0) {
        const firstCompanyId = getCompanyId(companyList[0])
        setSelectedCompanyId(firstCompanyId)
      }
    })

    return () => {
      ignore = true
    }
  }, [fetchCompanies, token])

  useEffect(() => {
    if (!selectedCompanyId) {
      setSelectedDemandId(null)
      return
    }

    fetchCompanyDetails(selectedCompanyId)
  }, [fetchCompanyDetails, selectedCompanyId])

  const handleSelectCompany = (companyId) => {
    setSelectedCompanyId(companyId)
    setSelectedDemandId(null)
  }

  const handleCreateCompany = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const nome = formData.get('nome')?.toString().trim()
    const cnpj = formData.get('cnpj')?.toString().trim()
    const dominio = formData.get('dominio')?.toString().trim()
    const responsavel = formData.get('responsavel')?.toString().trim()

    if (!nome) {
      toast.error('Informe o nome da empresa para continuar.')
      return
    }

    const payload = {
      nome,
      name: nome,
      cnpj,
      document: cnpj,
      identifier: cnpj,
      dominio,
      domain: dominio,
      responsavel,
      responsible: responsavel,
      responsibleName: responsavel
    }

    try {
      const response = await createCompanyRequest({
        endpoint: 'admin/companies',
        method: 'POST',
        data: payload
      })
      const createdCompany = response?.company ?? response
      updateCompaniesList(createdCompany)
      const companyId = getCompanyId(createdCompany)
      setSelectedCompanyId(companyId)
      setSelectedCompany(createdCompany)
      toast.success('Empresa criada com sucesso!')
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível criar a empresa. Verifique os dados e tente novamente.')
    }
  }

  const handleDeleteCompany = async (companyId) => {
    if (!companyId) {
      return
    }

    try {
      await deleteCompanyRequest({
        endpoint: `admin/companies/${companyId}`,
        method: 'DELETE'
      })

      setCompanies((previousCompanies) =>
        (Array.isArray(previousCompanies) ? previousCompanies : []).filter(
          (company) => getCompanyId(company) !== companyId
        )
      )

      if (selectedCompanyId === companyId) {
        setSelectedCompanyId(null)
        setSelectedCompany(null)
        setSelectedDemandId(null)
      }

      toast.success('Empresa removida com sucesso!')
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível remover a empresa selecionada.')
    }
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()

    if (!selectedCompanyId) {
      toast.error('Selecione uma empresa para adicionar novos usuários.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const nome = formData.get('nome')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const perfil = formData.get('perfil')?.toString().trim()

    if (!nome || !email) {
      toast.error('Informe nome e e-mail do usuário para continuar.')
      return
    }

    try {
      const response = await userRequest({
        endpoint: `admin/companies/${selectedCompanyId}/users`,
        method: 'POST',
        data: {
          nome,
          name: nome,
          email,
          perfil,
          role: perfil
        }
      })

      const createdUser = response?.user ?? response

      setSelectedCompany((currentCompany) => {
        if (!currentCompany) {
          return currentCompany
        }

        const updatedUsers = [...extractUsers(currentCompany), createdUser]
        const nextCompany = {
          ...currentCompany,
          users: updatedUsers,
          usuarios: updatedUsers
        }
        updateCompaniesList(nextCompany)
        return nextCompany
      })

      toast.success('Usuário adicionado com sucesso!')
      event.currentTarget.reset()
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível adicionar o usuário informado.')
    }
  }

  const handleDeleteUser = async (user) => {
    if (!selectedCompanyId) {
      return
    }

    const userId = getUserId(user)
    if (!userId) {
      toast.error('Não foi possível identificar o usuário selecionado.')
      return
    }

    try {
      await userRequest({
        endpoint: `admin/companies/${selectedCompanyId}/users/${userId}`,
        method: 'DELETE'
      })

      setSelectedCompany((currentCompany) => {
        if (!currentCompany) {
          return currentCompany
        }

        const updatedUsers = extractUsers(currentCompany).filter((currentUser) => getUserId(currentUser) !== userId)
        const nextCompany = {
          ...currentCompany,
          users: updatedUsers,
          usuarios: updatedUsers
        }
        updateCompaniesList(nextCompany)
        return nextCompany
      })

      toast.success('Usuário removido com sucesso!')
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível remover o usuário selecionado.')
    }
  }

  const handleChangeDemandForm = (field, value) => {
    setDemandForm((previousState) => ({
      ...previousState,
      [field]: value
    }))
  }

  const handleCreateDemand = async (event) => {
    event.preventDefault()

    if (!selectedCompanyId) {
      toast.error('Selecione uma empresa para cadastrar demandas.')
      return
    }

    const titulo = demandForm.titulo.trim()
    const descricao = demandForm.descricao.trim()

    if (!titulo || !descricao) {
      toast.error('Informe título e descrição da demanda.')
      return
    }

    try {
      const response = await demandRequest({
        endpoint: `admin/companies/${selectedCompanyId}/demands`,
        method: 'POST',
        data: {
          titulo,
          title: titulo,
          descricao,
          description: descricao,
          tipo: demandForm.tipo,
          type: demandForm.tipo,
          prioridade: demandForm.prioridade,
          priority: demandForm.prioridade,
          status: demandForm.status,
          situacao: demandForm.status,
          cliente: demandForm.cliente,
          customer: demandForm.cliente,
          chatbot: demandForm.chatbot
        }
      })

      const createdDemand = response?.demand ?? response

      setSelectedCompany((currentCompany) => {
        if (!currentCompany) {
          return currentCompany
        }

        const updatedDemands = [...extractDemands(currentCompany), createdDemand]
        const nextCompany = {
          ...currentCompany,
          demands: updatedDemands,
          demandas: updatedDemands
        }
        updateCompaniesList(nextCompany)
        return nextCompany
      })

      setSelectedDemandId(getDemandId(createdDemand))
      toast.success('Demanda criada com sucesso!')
      setDemandForm(INITIAL_DEMAND_FORM)
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível cadastrar a demanda.')
    }
  }

  const handleDeleteDemand = async (demand) => {
    if (!selectedCompanyId) {
      return
    }

    const demandId = getDemandId(demand)
    if (!demandId) {
      toast.error('Não foi possível identificar a demanda selecionada.')
      return
    }

    try {
      await demandRequest({
        endpoint: `admin/companies/${selectedCompanyId}/demands/${demandId}`,
        method: 'DELETE'
      })

      setSelectedCompany((currentCompany) => {
        if (!currentCompany) {
          return currentCompany
        }

        const updatedDemands = extractDemands(currentCompany).filter((currentDemand) => getDemandId(currentDemand) !== demandId)
        const nextCompany = {
          ...currentCompany,
          demands: updatedDemands,
          demandas: updatedDemands
        }
        updateCompaniesList(nextCompany)
        return nextCompany
      })

      setSelectedDemandId((currentDemandId) => (currentDemandId === demandId ? null : currentDemandId))
      toast.success('Demanda removida com sucesso!')
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível remover a demanda selecionada.')
    }
  }

  const selectedDemand = useMemo(() => {
    if (!selectedCompany || !selectedDemandId) {
      return null
    }

    return extractDemands(selectedCompany).find((demand) => getDemandId(demand) === selectedDemandId) ?? null
  }, [selectedCompany, selectedDemandId])

  const handleDemandUpdated = (updatedDemand) => {
    if (!updatedDemand) {
      return
    }

    const demandId = getDemandId(updatedDemand)
    if (!demandId) {
      return
    }

    setSelectedCompany((currentCompany) => {
      if (!currentCompany) {
        return currentCompany
      }

      const updatedDemands = extractDemands(currentCompany).map((currentDemand) =>
        getDemandId(currentDemand) === demandId ? { ...currentDemand, ...updatedDemand } : currentDemand
      )
      const nextCompany = {
        ...currentCompany,
        demands: updatedDemands,
        demandas: updatedDemands
      }
      updateCompaniesList(nextCompany)
      return nextCompany
    })

    setSelectedDemandId(demandId)
  }

  const handleDemandRemoved = (removedDemand) => {
    const demandId = typeof removedDemand === 'string' ? removedDemand : getDemandId(removedDemand)
    if (!demandId) {
      return
    }

    setSelectedCompany((currentCompany) => {
      if (!currentCompany) {
        return currentCompany
      }

      const updatedDemands = extractDemands(currentCompany).filter((demand) => getDemandId(demand) !== demandId)
      const nextCompany = {
        ...currentCompany,
        demands: updatedDemands,
        demandas: updatedDemands
      }
      updateCompaniesList(nextCompany)
      return nextCompany
    })

    setSelectedDemandId((currentDemandId) => (currentDemandId === demandId ? null : currentDemandId))
  }

  const handleRefreshCompanies = () => {
    fetchCompanies()
  }

  const renderCompaniesList = () => {
    if (loadingCompanies && companies.length === 0) {
      return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando empresas cadastradas...
        </div>
      )
    }

    if (!companies.length) {
      return (
        <p className="rounded-md border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
          Nenhuma empresa cadastrada até o momento.
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {companies.map((company) => {
          const companyId = getCompanyId(company)
          const isActive = companyId === selectedCompanyId
          return (
            <div
              key={companyId ?? getCompanyName(company)}
              className={`flex items-center justify-between rounded-md border px-3 py-2 transition hover:bg-muted ${isActive ? 'border-blue-400 bg-blue-50/70' : 'border-muted'}`}
            >
              <button
                type="button"
                className="flex flex-1 items-center justify-start gap-3 text-left"
                onClick={() => handleSelectCompany(companyId)}
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="flex flex-col">
                  <span className="font-medium text-sm">{getCompanyName(company)}</span>
                  <span className="text-xs text-muted-foreground">CNPJ: {getCompanyDocument(company)}</span>
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDeleteCompany(companyId)}
                disabled={deletingCompany}
                title="Remover empresa"
              >
                {deletingCompany && companyId === selectedCompanyId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestão de empresas</h2>
          <p className="text-sm text-muted-foreground">
            {admin?.nome ?? admin?.name ? `Bem-vindo, ${admin?.nome ?? admin?.name}.` : 'Gerencie empresas, usuários e demandas vinculadas.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshCompanies} disabled={loadingCompanies}>
            {loadingCompanies && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Atualizar lista
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              Empresas cadastradas
            </CardTitle>
            <CardDescription>Selecione uma empresa para visualizar e administrar seus dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderCompaniesList()}

            <Separator />

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <PlusCircle className="h-4 w-4" /> Nova empresa
              </h3>
              <form className="space-y-3" onSubmit={handleCreateCompany}>
                <div className="space-y-1">
                  <Label htmlFor="novo-nome-empresa">Razão social</Label>
                  <Input id="novo-nome-empresa" name="nome" placeholder="Ex.: BotUp Tecnologia" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="novo-cnpj">CNPJ</Label>
                  <Input id="novo-cnpj" name="cnpj" placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="novo-dominio">Domínio</Label>
                  <Input id="novo-dominio" name="dominio" placeholder="empresa.com.br" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="novo-responsavel">Responsável</Label>
                  <Input id="novo-responsavel" name="responsavel" placeholder="Nome do responsável" />
                </div>
                <Button type="submit" className="w-full" disabled={creatingCompany}>
                  {creatingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar empresa
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users2 className="h-5 w-5 text-blue-600" />
                Detalhes da empresa
              </CardTitle>
              <CardDescription>
                Visualize informações gerais, usuários associados e demandas registradas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingCompanyDetails && (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/40 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Atualizando informações da empresa...
                </div>
              )}

              {!selectedCompany && !loadingCompanyDetails && (
                <p className="rounded-md border border-dashed border-muted-foreground/30 p-4 text-sm text-muted-foreground">
                  Selecione uma empresa para exibir os detalhes cadastrados.
                </p>
              )}

              {selectedCompany && (
                <div className="space-y-6">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Informações gerais</h3>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium uppercase text-muted-foreground">Empresa</dt>
                        <dd className="text-sm font-semibold text-foreground">{getCompanyName(selectedCompany)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase text-muted-foreground">CNPJ</dt>
                        <dd className="text-sm text-foreground">{getCompanyDocument(selectedCompany)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase text-muted-foreground">Domínio</dt>
                        <dd className="text-sm text-foreground">{getCompanyDomain(selectedCompany)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase text-muted-foreground">Total de usuários</dt>
                        <dd className="text-sm text-foreground">{extractUsers(selectedCompany).length}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                        <UserPlus2 className="h-4 w-4" /> Usuários da empresa
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {extractUsers(selectedCompany).length === 0 ? (
                        <p className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground">
                          Nenhum usuário cadastrado para esta empresa.
                        </p>
                      ) : (
                        extractUsers(selectedCompany).map((user) => (
                          <div
                            key={getUserId(user) ?? getUserEmail(user)}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{getUserName(user)}</span>
                              <span className="text-xs text-muted-foreground">{getUserEmail(user)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {getUserRole(user)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteUser(user)}
                                disabled={updatingUsers}
                              >
                                {updatingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form className="grid gap-3 rounded-lg border bg-muted/30 p-4" onSubmit={handleCreateUser}>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="novo-usuario-nome">Nome completo</Label>
                          <Input id="novo-usuario-nome" name="nome" placeholder="Maria Silva" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="novo-usuario-email">E-mail</Label>
                          <Input id="novo-usuario-email" name="email" type="email" placeholder="maria@empresa.com" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="novo-usuario-perfil">Perfil de acesso</Label>
                        <Input id="novo-usuario-perfil" name="perfil" placeholder="Administrador, Analista..." />
                      </div>
                      <Button type="submit" className="w-full" disabled={updatingUsers}>
                        {updatingUsers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Adicionar usuário
                      </Button>
                    </form>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                        <MessageSquare className="h-4 w-4" /> Demandas vinculadas
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {extractDemands(selectedCompany).length === 0 ? (
                        <p className="rounded-md border border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground">
                          Nenhuma demanda registrada para esta empresa.
                        </p>
                      ) : (
                        extractDemands(selectedCompany).map((demand) => {
                          const demandId = getDemandId(demand)
                          const isActive = demandId === selectedDemandId
                          return (
                            <div
                              key={demandId ?? getDemandTitle(demand)}
                              className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 transition ${isActive ? 'border-blue-400 bg-blue-50/70' : 'border-muted hover:bg-muted/60'}`}
                            >
                              <button
                                type="button"
                                className="flex flex-1 flex-col items-start text-left"
                                onClick={() => setSelectedDemandId(demandId)}
                              >
                                <span className="font-medium text-sm">{getDemandTitle(demand)}</span>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="capitalize">{getDemandType(demand)}</Badge>
                                  <Badge variant="secondary" className="capitalize">{getDemandPriority(demand)}</Badge>
                                  <Badge className="capitalize">{getDemandStatus(demand)}</Badge>
                                </div>
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteDemand(demand)}
                                disabled={updatingDemands}
                                title="Remover demanda"
                              >
                                {updatingDemands ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <form className="space-y-4 rounded-lg border bg-muted/30 p-4" onSubmit={handleCreateDemand}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="nova-demanda-titulo">Título</Label>
                          <Input
                            id="nova-demanda-titulo"
                            value={demandForm.titulo}
                            onChange={(event) => handleChangeDemandForm('titulo', event.target.value)}
                            placeholder="Ex.: Integração com WhatsApp"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="nova-demanda-cliente">Cliente</Label>
                          <Input
                            id="nova-demanda-cliente"
                            value={demandForm.cliente}
                            onChange={(event) => handleChangeDemandForm('cliente', event.target.value)}
                            placeholder="Nome do solicitante"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="nova-demanda-chatbot">Chatbot</Label>
                          <Input
                            id="nova-demanda-chatbot"
                            value={demandForm.chatbot}
                            onChange={(event) => handleChangeDemandForm('chatbot', event.target.value)}
                            placeholder="Nome do chatbot"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Status</Label>
                          <Select
                            value={demandForm.status}
                            onValueChange={(value) => handleChangeDemandForm('status', value)}
                          >
                            <SelectTrigger className="w-full justify-between">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEMAND_STATUS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Prioridade</Label>
                          <Select
                            value={demandForm.prioridade}
                            onValueChange={(value) => handleChangeDemandForm('prioridade', value)}
                          >
                            <SelectTrigger className="w-full justify-between">
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEMAND_PRIORITIES.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Tipo</Label>
                          <Select
                            value={demandForm.tipo}
                            onValueChange={(value) => handleChangeDemandForm('tipo', value)}
                          >
                            <SelectTrigger className="w-full justify-between">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEMAND_TYPES.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="nova-demanda-descricao">Descrição</Label>
                        <Textarea
                          id="nova-demanda-descricao"
                          rows={4}
                          value={demandForm.descricao}
                          onChange={(event) => handleChangeDemandForm('descricao', event.target.value)}
                          placeholder="Detalhe a necessidade do cliente e o contexto da demanda."
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={updatingDemands}>
                        {updatingDemands && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar demanda
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDemand && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FilePlus2 className="h-5 w-5 text-blue-600" />
                  Detalhes da demanda selecionada
                </CardTitle>
                <CardDescription>Atualize o status, prioridade ou registre novas interações com o cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                <DemandDetails
                  companyId={selectedCompanyId}
                  demand={selectedDemand}
                  onBack={() => setSelectedDemandId(null)}
                  onUpdateDemand={handleDemandUpdated}
                  onRemoveDemand={handleDemandRemoved}
                  token={token}
                  isAdmin
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyManagement

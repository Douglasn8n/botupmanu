import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Plus, Search, MessageSquare, Bug, Zap, Clock, CheckCircle, AlertCircle, User, Bell } from 'lucide-react'
import DemandDetails from './components/DemandDetails.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('minhas-demandas')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterType, setFilterType] = useState('todos')
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedDemand, setSelectedDemand] = useState(null)
  const [selectedTipoDemanda, setSelectedTipoDemanda] = useState('')

  // Dados de exemplo para as demandas
  const [demandas, setDemandas] = useState([
    {
      id: 1,
      titulo: 'Integração com WhatsApp Business',
      descricao: 'Implementar integração completa com a API do WhatsApp Business para envio e recebimento de mensagens.',
      tipo: 'nova-funcionalidade',
      status: 'em-desenvolvimento',
      prioridade: 'alta',
      cliente: 'João Silva',
      chatbot: 'Bot Vendas',
      dataCreacao: '2024-01-15',
      ultimaAtualizacao: '2024-01-20'
    },
    {
      id: 2,
      titulo: 'Correção no fluxo de pagamento',
      descricao: 'O bot não está processando corretamente os pagamentos via PIX.',
      tipo: 'alteracao',
      status: 'novo',
      prioridade: 'urgente',
      cliente: 'Maria Santos',
      chatbot: 'Bot E-commerce',
      dataCreacao: '2024-01-18',
      ultimaAtualizacao: '2024-01-18'
    },
    {
      id: 3,
      titulo: 'Otimização de respostas',
      descricao: 'Melhorar a velocidade de resposta do bot durante horários de pico.',
      tipo: 'otimizacao',
      status: 'concluido',
      prioridade: 'media',
      cliente: 'Pedro Costa',
      chatbot: 'Bot Atendimento',
      dataCreacao: '2024-01-10',
      ultimaAtualizacao: '2024-01-17'
    }
  ])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'novo': return <AlertCircle className="h-4 w-4" />
      case 'em-analise': return <Clock className="h-4 w-4" />
      case 'em-desenvolvimento': return <Clock className="h-4 w-4" />
      case 'aguardando-feedback': return <MessageSquare className="h-4 w-4" />
      case 'concluido': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800'
      case 'em-analise': return 'bg-yellow-100 text-yellow-800'
      case 'em-desenvolvimento': return 'bg-orange-100 text-orange-800'
      case 'aguardando-feedback': return 'bg-purple-100 text-purple-800'
      case 'concluido': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'nova-funcionalidade': return <Plus className="h-4 w-4" />
      case 'correcao-erro': return <Bug className="h-4 w-4" />
      case 'alteracao': return <Bug className="h-4 w-4" />
      case 'otimizacao': return <Zap className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'baixa': return 'bg-gray-100 text-gray-800'
      case 'media': return 'bg-blue-100 text-blue-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'urgente': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDemandas = demandas.filter(demanda => {
    const matchesSearch = demanda.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demanda.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || demanda.status === filterStatus
    const matchesType = filterType === 'todos' || demanda.tipo === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const handleNewDemand = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    // Construir objeto base da demanda
    const novaDemanda = {
      id: demandas.length + 1,
      titulo: formData.get('titulo'),
      descricao: formData.get('descricao'),
      tipo: formData.get('tipo'),
      status: 'novo',
      prioridade: formData.get('prioridade'),
      cliente: 'Usuário Atual',
      chatbot: 'Sistema Geral', // Valor padrão já que removemos o campo
      dataCreacao: new Date().toISOString().split('T')[0],
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    }

    // Adicionar campos específicos baseados no tipo
    if (formData.get('tipo') === 'correcao-erro') {
      novaDemanda.qualErro = formData.get('qualErro')
      novaDemanda.comoDeveFicarErro = formData.get('comoDeveFicarErro')
    } else if (formData.get('tipo') === 'alteracao') {
      novaDemanda.comoEstaAgora = formData.get('comoEstaAgora')
      novaDemanda.comoDeveFicarAlteracao = formData.get('comoDeveFicarAlteracao')
    }

    setDemandas([...demandas, novaDemanda])
    event.target.reset()
    setSelectedTipoDemanda('') // Resetar o tipo selecionado
    setActiveTab('minhas-demandas')
  }

  const handleDemandClick = (demanda) => {
    setSelectedDemand(demanda)
  }

  const handleBackToDemands = () => {
    setSelectedDemand(null)
  }

  const handleUpdateDemand = (updatedDemand) => {
    setDemandas(demandas.map(demanda => 
      demanda.id === updatedDemand.id 
        ? { ...updatedDemand, ultimaAtualizacao: new Date().toISOString().split('T')[0] }
        : demanda
    ))
    setSelectedDemand(updatedDemand)
  }

  // Se uma demanda está selecionada, mostrar os detalhes
  if (selectedDemand) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Painel de Demandas de Chatbots</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={isAdmin ? 'bg-orange-100 text-orange-800' : ''}
                >
                  {isAdmin ? 'Modo Admin' : 'Modo Cliente'}
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
                </Button>
                <span className="text-sm text-gray-600">Olá, {isAdmin ? 'Desenvolvedor' : 'Cliente'}</span>
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Detalhes da Demanda */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DemandDetails 
            demand={selectedDemand}
            onBack={handleBackToDemands}
            onUpdateDemand={handleUpdateDemand}
            isAdmin={isAdmin}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Painel de Demandas de Chatbots</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdmin(!isAdmin)}
                className={isAdmin ? 'bg-orange-100 text-orange-800' : ''}
              >
                {isAdmin ? 'Modo Admin' : 'Modo Cliente'}
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <span className="text-sm text-gray-600">Olá, {isAdmin ? 'Desenvolvedor' : 'Cliente'}</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="minhas-demandas">Minhas Demandas</TabsTrigger>
            <TabsTrigger value="nova-demanda">Nova Demanda</TabsTrigger>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Minhas Demandas */}
          <TabsContent value="minhas-demandas" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar demandas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em-analise">Em Análise</SelectItem>
                  <SelectItem value="em-desenvolvimento">Em Desenvolvimento</SelectItem>
                  <SelectItem value="aguardando-feedback">Aguardando Feedback</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="nova-funcionalidade">Nova Funcionalidade</SelectItem>
                  <SelectItem value="correcao-erro">Correção de Erro</SelectItem>
                  <SelectItem value="alteracao">Alteração</SelectItem>
                  <SelectItem value="otimizacao">Otimização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredDemandas.map((demanda) => (
                <Card 
                  key={demanda.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleDemandClick(demanda)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{demanda.titulo}</CardTitle>
                        <CardDescription>{demanda.descricao}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(demanda.tipo)}
                        <Badge variant="outline" className={getPrioridadeColor(demanda.prioridade)}>
                          {demanda.prioridade}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(demanda.status)}>
                          {getStatusIcon(demanda.status)}
                          <span className="ml-1 capitalize">{demanda.status.replace('-', ' ')}</span>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          {getTipoIcon(demanda.tipo)}
                          <span className="capitalize">{demanda.tipo.replace('-', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-gray-600">Chatbot: {demanda.chatbot}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Criado em {new Date(demanda.dataCreacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Nova Demanda */}
          <TabsContent value="nova-demanda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Demanda</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo para solicitar uma nova funcionalidade, reportar um erro ou sugerir uma otimização.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewDemand} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Demanda</Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      placeholder="Descreva brevemente sua solicitação"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição Detalhada</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      placeholder="Forneça uma descrição detalhada da sua solicitação, incluindo contexto e requisitos específicos"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Demanda</Label>
                      <Select 
                        name="tipo" 
                        required 
                        onValueChange={(value) => setSelectedTipoDemanda(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nova-funcionalidade">Nova Funcionalidade</SelectItem>
                          <SelectItem value="correcao-erro">Correção de Erro</SelectItem>
                          <SelectItem value="alteracao">Alteração</SelectItem>
                          <SelectItem value="otimizacao">Otimização</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade</Label>
                      <Select name="prioridade" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Campos condicionais baseados no tipo de demanda */}
                  {selectedTipoDemanda === 'correcao-erro' && (
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 flex items-center">
                        <Bug className="h-4 w-4 mr-2" />
                        Detalhes da Correção de Erro
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="qual-erro">Qual é o erro?</Label>
                        <Textarea
                          id="qual-erro"
                          name="qualErro"
                          placeholder="Descreva detalhadamente o erro que está ocorrendo"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="como-deve-ficar-erro">Como deve ficar?</Label>
                        <Textarea
                          id="como-deve-ficar-erro"
                          name="comoDeveFicarErro"
                          placeholder="Descreva como o sistema deve funcionar corretamente"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {selectedTipoDemanda === 'alteracao' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <Bug className="h-4 w-4 mr-2" />
                        Detalhes da Alteração
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="como-esta-agora">Como está agora?</Label>
                        <Textarea
                          id="como-esta-agora"
                          name="comoEstaAgora"
                          placeholder="Descreva como o sistema funciona atualmente"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="como-deve-ficar-alteracao">Como deve ficar?</Label>
                        <Textarea
                          id="como-deve-ficar-alteracao"
                          name="comoDeveFicarAlteracao"
                          placeholder="Descreva como o sistema deve funcionar após a alteração"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Demanda
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demandas.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Desenvolvimento</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demandas.filter(d => d.status === 'em-desenvolvimento').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demandas.filter(d => d.status === 'concluido').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demandas.filter(d => d.prioridade === 'urgente').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Demandas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['novo', 'em-analise', 'em-desenvolvimento', 'aguardando-feedback', 'concluido'].map(status => {
                    const count = demandas.filter(d => d.status === status).length
                    const percentage = demandas.length > 0 ? (count / demandas.length) * 100 : 0
                    return (
                      <div key={status} className="flex items-center space-x-4">
                        <div className="w-24 text-sm capitalize">{status.replace('-', ' ')}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-right">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

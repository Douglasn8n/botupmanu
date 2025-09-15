import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx'
import { 
  MessageSquare, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Send,
  ArrowLeft,
  Edit
} from 'lucide-react'

const DemandDetails = ({ demand, onBack, onUpdateDemand, isAdmin = false }) => {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'João Silva',
      content: 'Obrigado por criar esta demanda. Vamos analisar e retornar em breve.',
      timestamp: '2024-01-16 10:30',
      isAdmin: true
    },
    {
      id: 2,
      author: 'Maria Santos',
      content: 'Gostaria de adicionar que seria interessante incluir também notificações por email.',
      timestamp: '2024-01-17 14:15',
      isAdmin: false
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

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'baixa': return 'bg-gray-100 text-gray-800'
      case 'media': return 'bg-blue-100 text-blue-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'urgente': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: isAdmin ? 'Desenvolvedor' : 'Cliente',
        content: newComment,
        timestamp: new Date().toLocaleString('pt-BR'),
        isAdmin: isAdmin
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  const handleStatusChange = (newStatus) => {
    onUpdateDemand({ ...demand, status: newStatus })
  }

  const handlePriorityChange = (newPriority) => {
    onUpdateDemand({ ...demand, prioridade: newPriority })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(demand.status)}>
            {getStatusIcon(demand.status)}
            <span className="ml-1 capitalize">{demand.status.replace('-', ' ')}</span>
          </Badge>
          <Badge variant="outline" className={getPrioridadeColor(demand.prioridade)}>
            {demand.prioridade}
          </Badge>
        </div>
      </div>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{demand.titulo}</CardTitle>
              <CardDescription className="text-base">{demand.descricao}</CardDescription>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-gray-600">{demand.cliente}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Chatbot</p>
                <p className="text-sm text-gray-600">{demand.chatbot}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-gray-600">
                  {new Date(demand.dataCreacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Última atualização</p>
                <p className="text-sm text-gray-600">
                  {new Date(demand.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles do Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={demand.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="em-analise">Em Análise</SelectItem>
                    <SelectItem value="em-desenvolvimento">Em Desenvolvimento</SelectItem>
                    <SelectItem value="aguardando-feedback">Aguardando Feedback</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select value={demand.prioridade} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
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
          </CardContent>
        </Card>
      )}

      {/* Comentários */}
      <Card>
        <CardHeader>
          <CardTitle>Comentários e Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de Comentários */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{comment.author}</p>
                    {comment.isAdmin && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                    <p className="text-xs text-gray-500">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Novo Comentário */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Adicionar Comentário</label>
            <Textarea
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Comentário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DemandDetails

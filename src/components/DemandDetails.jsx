import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
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
  Edit,
  Save,
  X,
  Plus,
  Bug,
  Zap,
  Loader2,
  Trash2
} from 'lucide-react'
import { useApi } from '@/hooks/use-api.js'
import { toast } from 'sonner'

const getDemandId = (demand) => demand?.id ?? demand?._id ?? demand?.uuid ?? demand?.demandId ?? demand?.codigo

const mapDemandToEditable = (demand) => ({
  titulo: demand?.titulo ?? demand?.title ?? '',
  descricao: demand?.descricao ?? demand?.description ?? '',
  tipo: demand?.tipo ?? demand?.type ?? 'nova-funcionalidade',
  chatbot: demand?.chatbot ?? demand?.bot ?? ''
})

const extractComments = (demand) => {
  if (!demand) {
    return []
  }

  if (Array.isArray(demand.comentarios)) {
    return demand.comentarios
  }

  if (Array.isArray(demand.comments)) {
    return demand.comments
  }

  if (Array.isArray(demand.historico)) {
    return demand.historico
  }

  return []
}

const resolveDemandFromResponse = (payload, fallback) => {
  if (!payload) {
    return fallback
  }

  if (payload.demand) {
    return payload.demand
  }

  if (payload.demanda) {
    return payload.demanda
  }

  if (payload.data) {
    const nested = resolveDemandFromResponse(payload.data, fallback)
    if (nested) {
      return nested
    }
  }

  if (Array.isArray(payload.demands) && payload.demands.length > 0) {
    return payload.demands.at(-1)
  }

  if (Array.isArray(payload.demandas) && payload.demandas.length > 0) {
    return payload.demandas.at(-1)
  }

  if (typeof payload === 'object' && (payload.titulo || payload.title || payload.status || payload.prioridade)) {
    return payload
  }

  return fallback
}

const resolveCommentFromResponse = (payload) => {
  if (!payload) {
    return null
  }

  if (payload.comment) {
    return payload.comment
  }

  if (payload.comentario && typeof payload.comentario === 'object') {
    return payload.comentario
  }

  if (payload.data) {
    return resolveCommentFromResponse(payload.data)
  }

  if (Array.isArray(payload.comments) && payload.comments.length > 0) {
    return payload.comments.at(-1)
  }

  if (Array.isArray(payload.comentarios) && payload.comentarios.length > 0) {
    return payload.comentarios.at(-1)
  }

  if (typeof payload === 'object' && (payload.content || payload.comentario || payload.mensagem)) {
    return payload
  }

  return null
}

const getCommentAuthor = (comment) => comment?.author ?? comment?.autor ?? comment?.nome ?? 'Usuário'

const getCommentTimestamp = (comment) => comment?.timestamp ?? comment?.data ?? comment?.createdAt ?? comment?.created_at

const getCommentContent = (comment) => comment?.content ?? comment?.comentario ?? comment?.mensagem ?? comment?.texto ?? ''

const isCommentFromAdmin = (comment) => Boolean(comment?.isAdmin ?? comment?.admin ?? comment?.autorEhAdmin ?? false)

const getCommentId = (comment, index) => {
  return (
    comment?.id ??
    comment?._id ??
    comment?.uuid ??
    comment?.commentId ??
    comment?.codigo ??
    `${getCommentTimestamp(comment) ?? 'comment'}-${index}`
  )
}

const formatLabel = (value, fallback = '') => {
  if (!value) {
    return fallback
  }
  return String(value).replace(/-/g, ' ')
}

const formatDate = (value) => {
  if (!value) {
    return 'Não informado'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Não informado'
  }
  return date.toLocaleDateString('pt-BR')
}

const formatDateTime = (value) => {
  if (!value) {
    return 'Agora'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleString('pt-BR')
}

const DemandDetails = ({
  demand: initialDemand,
  companyId,
  token,
  onBack,
  onUpdateDemand,
  onRemoveDemand,
  isAdmin = false
}) => {
  const [demand, setDemand] = useState(initialDemand)
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedDemand, setEditedDemand] = useState(mapDemandToEditable(initialDemand))
  const [comments, setComments] = useState(extractComments(initialDemand))

  const { request: updateDemandRequest, loading: updatingDemand } = useApi({ token })
  const { request: commentRequest, loading: submittingComment } = useApi({ token })
  const { request: deleteDemandRequest, loading: deletingDemand } = useApi({ token })

  useEffect(() => {
    setDemand(initialDemand)
  }, [initialDemand])

  useEffect(() => {
    setEditedDemand(mapDemandToEditable(demand))
    setComments(extractComments(demand))
    setIsEditing(false)
  }, [demand])

  const demandId = getDemandId(demand)

  const buildDemandEndpoint = useCallback(() => {
    if (!companyId || !demandId) {
      return null
    }
    return `admin/companies/${companyId}/demands/${demandId}`
  }, [companyId, demandId])

  const handleDemandUpdate = useCallback(async (payload, successMessage) => {
    const endpoint = buildDemandEndpoint()

    if (!endpoint) {
      toast.error('Não foi possível identificar a demanda selecionada.')
      return null
    }

    try {
      const response = await updateDemandRequest({
        endpoint,
        method: 'PATCH',
        data: payload
      })

      let updatedDemand = resolveDemandFromResponse(response, null)
      if (!updatedDemand) {
        updatedDemand = demand ? { ...demand, ...payload } : payload
      }

      setDemand(updatedDemand)
      onUpdateDemand?.(updatedDemand)
      toast.success(successMessage)
      return updatedDemand
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível atualizar a demanda selecionada.')
      return null
    }
  }, [buildDemandEndpoint, demand, onUpdateDemand, updateDemandRequest])

  const handleStatusChange = (newStatus) => {
    handleDemandUpdate({ status: newStatus, situacao: newStatus }, 'Status atualizado com sucesso!')
  }

  const handlePriorityChange = (newPriority) => {
    handleDemandUpdate({ prioridade: newPriority, priority: newPriority }, 'Prioridade atualizada com sucesso!')
  }

  const handleSaveEdit = async () => {
    const titulo = editedDemand.titulo.trim()
    const descricao = editedDemand.descricao.trim()

    if (!titulo || !descricao) {
      toast.error('Informe título e descrição para salvar as alterações.')
      return
    }

    const updated = await handleDemandUpdate({
      titulo,
      title: titulo,
      descricao,
      description: descricao,
      tipo: editedDemand.tipo,
      type: editedDemand.tipo,
      chatbot: editedDemand.chatbot
    }, 'Demanda atualizada com sucesso!')

    if (updated) {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedDemand(mapDemandToEditable(demand))
    setIsEditing(false)
  }

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim()
    if (!trimmedComment) {
      return
    }

    const endpoint = buildDemandEndpoint()
    if (!endpoint) {
      toast.error('Não foi possível identificar a demanda selecionada.')
      return
    }

    try {
      const response = await commentRequest({
        endpoint: `${endpoint}/comments`,
        method: 'POST',
        data: {
          comentario: trimmedComment,
          content: trimmedComment,
          mensagem: trimmedComment,
          autor: isAdmin ? 'Administrador' : 'Cliente',
          author: isAdmin ? 'Administrador' : 'Cliente',
          isAdmin
        }
      })

      const updatedDemand = resolveDemandFromResponse(response, null)
      const createdComment = resolveCommentFromResponse(response)

      if (updatedDemand) {
        setDemand(updatedDemand)
        onUpdateDemand?.(updatedDemand)
        setComments(extractComments(updatedDemand))
      } else if (createdComment) {
        setComments((previous) => [...previous, createdComment])
      } else {
        setComments((previous) => [
          ...previous,
          {
            id: Date.now(),
            author: isAdmin ? 'Administrador' : 'Cliente',
            content: trimmedComment,
            timestamp: new Date().toISOString(),
            isAdmin
          }
        ])
      }

      setNewComment('')
      toast.success('Comentário enviado com sucesso!')
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível registrar o comentário.')
    }
  }

  const handleDeleteDemand = async () => {
    const endpoint = buildDemandEndpoint()
    if (!endpoint) {
      toast.error('Não foi possível identificar a demanda selecionada.')
      return
    }

    try {
      await deleteDemandRequest({ endpoint, method: 'DELETE' })
      toast.success('Demanda removida com sucesso!')
      onRemoveDemand?.(demand)
      onBack?.()
    } catch (error) {
      toast.error(error?.message ?? 'Não foi possível remover a demanda selecionada.')
    }
  }

  if (!demand) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
        Nenhuma demanda selecionada no momento.
      </div>
    )
  }

  const demandStatus = demand?.status ?? demand?.situacao ?? 'novo'
  const demandPriority = demand?.prioridade ?? demand?.priority ?? 'media'
  const demandType = demand?.tipo ?? demand?.type ?? 'nova-funcionalidade'
  const demandTitle = demand?.titulo ?? demand?.title ?? 'Demanda sem título'
  const demandDescription = demand?.descricao ?? demand?.description ?? 'Sem descrição fornecida.'
  const demandClient = demand?.cliente ?? demand?.client ?? 'Não informado'
  const demandChatbot = demand?.chatbot ?? demand?.bot ?? 'Não informado'
  const demandCreatedAt = demand?.dataCreacao ?? demand?.createdAt ?? demand?.created_at

  const getStatusIcon = (status) => {
    switch (status) {
      case 'novo':
        return <AlertCircle className="h-4 w-4" />
      case 'em-analise':
        return <Clock className="h-4 w-4" />
      case 'em-desenvolvimento':
        return <Clock className="h-4 w-4" />
      case 'aguardando-feedback':
        return <MessageSquare className="h-4 w-4" />
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800'
      case 'em-analise':
        return 'bg-yellow-100 text-yellow-800'
      case 'em-desenvolvimento':
        return 'bg-orange-100 text-orange-800'
      case 'aguardando-feedback':
        return 'bg-purple-100 text-purple-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'baixa':
        return 'bg-gray-100 text-gray-800'
      case 'media':
        return 'bg-blue-100 text-blue-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'urgente':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'nova-funcionalidade':
        return <Plus className="h-4 w-4" />
      case 'correcao-erro':
        return <Bug className="h-4 w-4" />
      case 'alteracao':
        return <Bug className="h-4 w-4" />
      case 'otimizacao':
        return <Zap className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(demandStatus)}>
            {getStatusIcon(demandStatus)}
            <span className="ml-1 capitalize">{formatLabel(demandStatus)}</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            {getTipoIcon(demandType)}
            <span className="capitalize">{formatLabel(demandType)}</span>
          </Badge>
          <Badge variant="outline" className={getPrioridadeColor(demandPriority)}>
            {formatLabel(demandPriority)}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={editedDemand.titulo}
                      onChange={(event) => setEditedDemand((state) => ({ ...state, titulo: event.target.value }))}
                      className="text-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={editedDemand.descricao}
                      onChange={(event) => setEditedDemand((state) => ({ ...state, descricao: event.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{demandTitle}</CardTitle>
                  <CardDescription className="text-base">{demandDescription}</CardDescription>
                </>
              )}
            </div>
            {isAdmin && (
              <div className="ml-4 flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={updatingDemand}>
                      {updatingDemand ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={updatingDemand}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Cliente</p>
                <p className="text-sm text-gray-600">{demandClient}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Chatbot</p>
                {isEditing ? (
                  <Input
                    value={editedDemand.chatbot}
                    onChange={(event) => setEditedDemand((state) => ({ ...state, chatbot: event.target.value }))}
                    placeholder="Nome do chatbot"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{demandChatbot}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Tipo</p>
                {isEditing ? (
                  <Select
                    value={editedDemand.tipo}
                    onValueChange={(value) => setEditedDemand((state) => ({ ...state, tipo: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nova-funcionalidade">Nova funcionalidade</SelectItem>
                      <SelectItem value="correcao-erro">Correção de erro</SelectItem>
                      <SelectItem value="alteracao">Alteração</SelectItem>
                      <SelectItem value="otimizacao">Otimização</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 capitalize">{formatLabel(demandType)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-gray-600">{formatDate(demandCreatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar demanda</CardTitle>
            <CardDescription>Atualize o status, prioridade ou remova esta demanda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={demandStatus} onValueChange={handleStatusChange} disabled={updatingDemand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="em-analise">Em análise</SelectItem>
                    <SelectItem value="em-desenvolvimento">Em desenvolvimento</SelectItem>
                    <SelectItem value="aguardando-feedback">Aguardando feedback</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select value={demandPriority} onValueChange={handlePriorityChange} disabled={updatingDemand}>
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

            <Separator />

            <Button variant="destructive" onClick={handleDeleteDemand} disabled={deletingDemand}>
              {deletingDemand ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Remover demanda
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comentários e histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum comentário registrado até o momento.</p>
            ) : (
              comments.map((comment, index) => {
                const author = getCommentAuthor(comment)
                const initials = author
                  .split(' ')
                  .filter(Boolean)
                  .map((word) => word[0]?.toUpperCase())
                  .join('')
                  .slice(0, 2)

                return (
                  <div key={getCommentId(comment, index)} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials || 'US'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{author}</p>
                        {isCommentFromAdmin(comment) && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        <p className="text-xs text-gray-500">{formatDateTime(getCommentTimestamp(comment))}</p>
                      </div>
                      <p className="text-sm text-gray-700">{getCommentContent(comment)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="text-sm font-medium">Adicionar comentário</label>
            <Textarea
              placeholder="Digite seu comentário..."
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              rows={3}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment}>
              {submittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar comentário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DemandDetails

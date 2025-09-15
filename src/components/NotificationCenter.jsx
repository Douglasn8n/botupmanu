import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Clock,
  X,
  MarkAsRead
} from 'lucide-react'

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'status_change',
      title: 'Status da demanda alterado',
      message: 'A demanda "Integração com WhatsApp Business" foi movida para "Em Desenvolvimento"',
      timestamp: '2024-01-20 14:30',
      read: false,
      demandId: 1
    },
    {
      id: 2,
      type: 'new_comment',
      title: 'Novo comentário',
      message: 'João Silva adicionou um comentário na demanda "Correção no fluxo de pagamento"',
      timestamp: '2024-01-19 16:45',
      read: false,
      demandId: 2
    },
    {
      id: 3,
      type: 'demand_completed',
      title: 'Demanda concluída',
      message: 'A demanda "Otimização de respostas" foi marcada como concluída',
      timestamp: '2024-01-17 11:20',
      read: true,
      demandId: 3
    },
    {
      id: 4,
      type: 'new_demand',
      title: 'Nova demanda criada',
      message: 'Uma nova demanda foi criada: "Implementar chat por voz"',
      timestamp: '2024-01-16 09:15',
      read: true,
      demandId: 4
    }
  ])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_change': return <Clock className="h-4 w-4" />
      case 'new_comment': return <MessageSquare className="h-4 w-4" />
      case 'demand_completed': return <CheckCircle className="h-4 w-4" />
      case 'new_demand': return <AlertCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'status_change': return 'text-blue-600'
      case 'new_comment': return 'text-purple-600'
      case 'demand_completed': return 'text-green-600'
      case 'new_demand': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
  }

  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <MarkAsRead className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-6">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Bell className="h-8 w-8 mb-2" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-sm font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs ${
                            notification.read ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationCenter

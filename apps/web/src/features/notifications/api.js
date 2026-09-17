import api from '@/lib/api'

export async function getNotifications({
  cursor,
  limit = 20,
  isRead,
  type,
} = {}) {
  const response = await api.get('/notifications', {
    params: {
      cursor: cursor ?? undefined,
      limit,
      isRead,
      type: type || undefined,
    },
  })

  return response.data
}

export async function getUnreadNotificationCount() {
  const response = await api.get('/notifications/unread-count')

  return response.data.data.unreadCount
}

export async function readNotification(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`)

  return response.data.data
}

export async function readAllNotifications() {
  const response = await api.patch('/notifications/read-all')

  return response.data.data.updatedCount
}

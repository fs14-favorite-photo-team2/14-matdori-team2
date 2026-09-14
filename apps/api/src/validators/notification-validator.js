import { object } from 'superstruct'

import {
  cursor,
  id,
  isRead,
  limit,
  notificationType,
  request,
} from './common-validator.js'

export const listNotificationsRequest = request({
  query: object({ cursor, limit, isRead, type: notificationType }),
})

export const unreadCountRequest = request()

export const readNotificationRequest = request({
  params: object({
    notificationId: id('notificationId', '알림 ID가 올바르지 않습니다.'),
  }),
})

export const readAllNotificationsRequest = request()

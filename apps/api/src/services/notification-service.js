import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  countUnreadNotifications,
  findNotificationsByReceiver,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  toNotification,
} from '../repositories/notification-repository.js'
import { toCursorPage } from '../utils/pagination.js'

export async function getMyNotifications(userId, query) {
  const notifications = await findNotificationsByReceiver(userId, query)

  return toCursorPage(notifications, query.limit, toNotification)
}

export async function getUnreadNotificationCount(userId) {
  const unreadCount = await countUnreadNotifications(userId)

  return { unreadCount }
}

export async function readNotification(userId, { notificationId }) {
  try {
    const notification = await markNotificationAsRead(userId, notificationId)

    return toNotification(notification)
  } catch (error) {
    if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
      throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
    }

    throw error
  }
}

export async function readAllNotifications(userId) {
  const { count } = await markAllNotificationsAsRead(userId)

  return { updatedCount: count }
}

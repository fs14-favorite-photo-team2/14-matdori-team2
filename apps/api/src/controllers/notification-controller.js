import { sendSuccess } from '../http/response.js'
import {
  getMyNotifications,
  getUnreadNotificationCount,
  readAllNotifications,
  readNotification,
} from '../services/notification-service.js'

export async function listNotificationsController(request, response, next) {
  try {
    const { data, meta } = await getMyNotifications(
      request.userId,
      request.validated.query,
    )

    return sendSuccess(response, data, { meta })
  } catch (error) {
    return next(error)
  }
}

export async function getUnreadCountController(request, response, next) {
  try {
    const unreadCount = await getUnreadNotificationCount(request.userId)

    return sendSuccess(response, unreadCount)
  } catch (error) {
    return next(error)
  }
}

export async function readNotificationController(request, response, next) {
  try {
    const notification = await readNotification(
      request.userId,
      request.validated.params,
    )

    return sendSuccess(response, notification)
  } catch (error) {
    return next(error)
  }
}

export async function readAllNotificationsController(request, response, next) {
  try {
    const updatedCount = await readAllNotifications(request.userId)

    return sendSuccess(response, updatedCount)
  } catch (error) {
    return next(error)
  }
}

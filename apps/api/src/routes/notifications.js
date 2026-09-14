import { Router } from 'express'

import {
  getUnreadCountController,
  listNotificationsController,
  readAllNotificationsController,
  readNotificationController,
} from '../controllers/notification-controller.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  listNotificationsRequest,
  readAllNotificationsRequest,
  readNotificationRequest,
  unreadCountRequest,
} from '../validators/notification-validator.js'

const notificationsRouter = Router()

notificationsRouter.use(requireAuthentication)

notificationsRouter.get(
  '/',
  validateRequest(listNotificationsRequest),
  listNotificationsController,
)
notificationsRouter.get(
  '/unread-count',
  validateRequest(unreadCountRequest),
  getUnreadCountController,
)
notificationsRouter.patch(
  '/read-all',
  validateRequest(readAllNotificationsRequest),
  readAllNotificationsController,
)
notificationsRouter.patch(
  '/:notificationId/read',
  validateRequest(readNotificationRequest),
  readNotificationController,
)

export default notificationsRouter

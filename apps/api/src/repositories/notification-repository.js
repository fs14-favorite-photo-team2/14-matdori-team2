import { prisma } from '../db/prisma.js'
import { getNotificationMessage } from '../utils/notification.js'
import { CREATED_AT_ORDER_BY, SORT_ORDERS } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import { recipeSummarySelect, toRecipeSummary } from './recipe-repository.js'
import { publicUserSelect } from './user-repository.js'

export const notificationSelect = {
  id: true,
  type: true,
  actor: { select: publicUserSelect },
  recipe: { select: recipeSummarySelect },
  listingId: true,
  purchaseId: true,
  tradeOfferId: true,
  isRead: true,
  createdAt: true,
}

export function toNotification({ actor, recipe, ...notification }) {
  return {
    ...notification,
    message: getNotificationMessage(notification.type, actor, recipe),
    actor,
    recipe: recipe && toRecipeSummary(recipe),
  }
}

export function findNotificationsByReceiver(
  userId,
  { isRead, type, cursor, limit },
) {
  return findCursorPage(prisma.notification, {
    where: {
      userId,
      ...(isRead === undefined ? {} : { isRead }),
      ...(type ? { type } : {}),
    },
    select: notificationSelect,
    orderBy: CREATED_AT_ORDER_BY[SORT_ORDERS.NEWEST],
    cursor,
    limit,
  })
}

export function countUnreadNotifications(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } })
}

export function markNotificationAsRead(userId, id) {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
    select: notificationSelect,
  })
}

export function markAllNotificationsAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

import { NotificationType } from '../generated/prisma/enums.ts'

const DELETED_ACTOR = '탈퇴한 회원'
const DELETED_RECIPE = '제목 없음'

const NOTIFICATION_MESSAGES = Object.freeze({
  [NotificationType.PURCHASED]: (actor, recipe) =>
    `${actor}님이 '${recipe}' 레시피를 구매했습니다.`,
  [NotificationType.SOLD_OUT]: (_actor, recipe) =>
    `'${recipe}' 레시피가 모두 판매되었습니다.`,
  [NotificationType.TRADE_OFFER_NEW]: (actor, recipe) =>
    `${actor}님이 '${recipe}' 레시피에 교환을 제안했습니다.`,
  [NotificationType.TRADE_OFFER_ACCEPT]: (actor, recipe) =>
    `${actor}님이 '${recipe}' 레시피 교환 제안을 수락했습니다.`,
  [NotificationType.TRADE_OFFER_REFUSE]: (actor, recipe) =>
    `${actor}님이 '${recipe}' 레시피 교환 제안을 거절했습니다.`,
})

export function getNotificationMessage(type, actor, recipe) {
  return NOTIFICATION_MESSAGES[type](
    actor?.nickname ?? DELETED_ACTOR,
    recipe?.title ?? DELETED_RECIPE,
  )
}

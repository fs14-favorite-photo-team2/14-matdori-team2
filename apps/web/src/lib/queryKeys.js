export const queryKeys = {
  auth: {
    currentUser: () => ['currentUser'],
  },

  marketplace: {
    all: ['marketplace'],
    lists: () => [...queryKeys.marketplace.all, 'list'],
    list: (params) => [...queryKeys.marketplace.lists(), params],
    counts: () => [...queryKeys.marketplace.lists(), 'count'],
    count: (params = {}) => [...queryKeys.marketplace.counts(), params],
    details: () => [...queryKeys.marketplace.all, 'detail'],
    detail: (listingId) => [
      ...queryKeys.marketplace.details(),
      String(listingId),
    ],
  },

  recipes: {
    all: ['recipes'],
    details: () => [...queryKeys.recipes.all, 'detail'],
    detail: (recipeId) => [...queryKeys.recipes.details(), String(recipeId)],
  },

  myKitchen: {
    all: ['my-kitchen'],
    lists: () => [...queryKeys.myKitchen.all, 'list'],
    list: (params = {}) => [...queryKeys.myKitchen.lists(), params],
    counts: () => [...queryKeys.myKitchen.lists(), 'count'],
    count: (params = {}) => [...queryKeys.myKitchen.counts(), params],
  },

  mySales: {
    all: ['my-sales'],
    lists: () => [...queryKeys.mySales.all, 'list'],
    list: (params = {}) => [...queryKeys.mySales.lists(), params],
    counts: () => [...queryKeys.mySales.lists(), 'count'],
    count: (params = {}) => [...queryKeys.mySales.counts(), params],
  },

  tradeOffers: {
    all: ['trade-offers'],
    sent: (params = {}) => [...queryKeys.tradeOffers.all, 'sent', params], // 보낸 교환 제안 목록
    sentCount: (params = {}) => [
      ...queryKeys.tradeOffers.all,
      'sent',
      'count',
      params,
    ],
    byListing: (listingId, params = {}) => [
      ...queryKeys.tradeOffers.all,
      'listing',
      String(listingId),
      params,
    ],
  },

  notifications: {
    all: ['notifications'],
    lists: () => [...queryKeys.notifications.all, 'list'],

    // 로그인한 사용자가 받은 전체 알림 목록
    list: (params = {}) => [...queryKeys.notifications.lists(), params],

    // 아직 읽지 않은 알림 개수
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'],
  },
}

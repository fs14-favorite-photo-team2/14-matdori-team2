export function normalizeOwnListing(listing) {
  return {
    id: `listing-${listing.id}`,
    relationType: 'OWN_LISTING',
    listingType: listing.listingType,
    listingStatus: listing.status,
    badgeType: listing.status === 'ON_SALE' ? 'selling' : undefined,
    price: listing.price,
    recipe: listing.recipe,
    remainingQuantity: listing.remainingQuantity,
  }
}

// 지금 당장 여기 이 함수 하나만 나중에 고치면 됨:
// 백엔드가 trade-offers 응답에 listing 필드를 추가해주면,
// listingDetailMap 관련 부분을 지우고 offer.listing 을 바로 쓰면 끝.
export function normalizeSentOffer(offer, listingDetailMap) {
  const listing = listingDetailMap.get(offer.listingId) // ← 지금은 이렇게, 나중엔 offer.listing 으로 교체
  if (!listing) return null

  return {
    id: `offer-${offer.id}`,
    relationType: 'SENT_OFFER',
    tradeOfferStatus: offer.status,
    listingStatus: listing.status,
    sellerNickname: listing.seller?.nickname,
    recipe: listing.recipe,
    remainingQuantity: listing.remainingQuantity,
    price: listing.price,
  }
}

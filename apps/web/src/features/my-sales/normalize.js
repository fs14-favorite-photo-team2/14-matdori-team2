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

export function normalizeSentOffer(offer) {
  const { listing } = offer
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

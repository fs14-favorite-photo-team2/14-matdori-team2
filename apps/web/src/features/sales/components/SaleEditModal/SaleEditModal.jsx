import SaleRegistrationModal from '../SaleRegistrationModal/SaleRegistrationModal'

export default function SaleEditModal({ isOpen, onClose, onSubmit, listing }) {
  if (!isOpen || !listing) return null

  // 기존 판매글에 남은 수량과 별도로 판매 가능한 보유 수량을 합친 수정 가능 최대 수량
  // 이미 판매된 수량(initialQuantity - remainingQuantity)은 다시 판매할 수 없으므로 포함하지 않는다.
  const maxSaleQuantity =
    listing.remainingQuantity + (listing.availableOwnedQuantity ?? 0)

  const selectedRecipe = {
    recipeId: listing.recipe.id,
    title: listing.recipe.title,
    thumbnailUrl: listing.recipe.imageUrls[0],
    difficulty: listing.recipe.difficulty,
    category: listing.recipe.category,
    creatorNickname: listing.seller.nickname,
    availableQuantity: maxSaleQuantity,
  }

  const initialValues = {
    // 수정 모달을 열었을 때 현재 판매글에 남아 있는 수량을 기본값으로 보여준다.
    quantity: listing.remainingQuantity,
    unitPrice: listing.price,
    desiredDifficulty: listing.wantedDifficulty,
    desiredCategory: listing.wantedCategory,
    exchangeDescription: listing.wantedDescription,
  }

  function handleSubmit(formData) {
    onSubmit?.({
      listingId: listing.id,
      ...formData,
    })
  }

  return (
    <SaleRegistrationModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      selectedRecipe={selectedRecipe}
      mode="edit"
      initialValues={initialValues}
    />
  )
}

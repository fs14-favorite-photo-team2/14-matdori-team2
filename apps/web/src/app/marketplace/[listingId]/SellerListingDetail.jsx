'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import Button from '@/components/common/Button/Button'
import MobileHeader from '@/components/layout/Header/MobileHeader/MobileHeader'
import ActionConfirmModal from '@/components/common/ActionConfirmModal/ActionConfirmModal'

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

export default function SellerListingDetail({ listing }) {
  const { recipe, seller, myTradeOffers } = listing

  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === recipe.difficulty,
  )

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === recipe.category,
  )

  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false)
  const [tradeOffers, setTradeOffers] = useState(myTradeOffers)
  const [rejectTargetOffer, setRejectTargetOffer] = useState(null)

  const imageCount = recipe.imageUrls.length
  const currentImageUrl = recipe.imageUrls[currentImageIndex]
  const hasMultipleImages = imageCount > 1
  const isExchangeAvailable = listing.listingType === 'BOTH'

  function handlePreviousImage() {
    setCurrentImageIndex(
      (currentIndex) => (currentIndex - 1 + imageCount) % imageCount,
    )
  }

  function handleNextImage() {
    setCurrentImageIndex((currentIndex) => (currentIndex + 1) % imageCount)
  }

  const wantedDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === listing.wantedDifficulty,
  )

  const wantedCategoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === listing.wantedCategory,
  )

  const wantedDifficultyClassName =
    DIFFICULTY_CLASS_NAMES[wantedDifficultyOption?.tone] ?? ''

  const rejectTargetRecipe = rejectTargetOffer?.offeredCopy.recipe

  const rejectTargetDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === rejectTargetRecipe?.difficulty,
  )

  function handleRejectTradeOffer() {
    if (!rejectTargetOffer) return

    // TODO: 교환 제시 거절 API 연결 후 목록 재조회
    setTradeOffers((currentOffers) =>
      currentOffers.filter((offer) => offer.id !== rejectTargetOffer.id),
    )

    setRejectTargetOffer(null)
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <MobileHeader title="마켓플레이스" backHref="/marketplace" />

        <p className={styles.pageLabel}>마켓플레이스</p>

        <h1 className={`${styles.title} font-baskin-robbins`}>
          {recipe.title}
        </h1>

        <section className={styles.productSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={currentImageUrl}
              alt={`${recipe.title} ${currentImageIndex + 1}번째 이미지`}
              fill
              preload
              sizes="(max-width: 743px) 100vw, (max-width: 1023px) 50vw, 780px"
              className={styles.thumbnail}
            />

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  className={`${styles.carouselButton} ${styles.previousButton}`}
                  onClick={handlePreviousImage}
                  aria-label="이전 이미지 보기"
                >
                  <Image
                    src="/icons/recipe-carousel-prev.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>

                <button
                  type="button"
                  className={`${styles.carouselButton} ${styles.nextButton}`}
                  onClick={handleNextImage}
                  aria-label="다음 이미지 보기"
                >
                  <Image
                    src="/icons/recipe-carousel-next.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </>
            )}
          </div>

          <div className={styles.productInfo}>
            <div className={styles.metaRow}>
              <div className={styles.recipeMeta}>
                <span className={`${styles.difficulty} ${difficultyClassName}`}>
                  {difficultyOption?.label ?? recipe.difficulty}
                </span>

                <span className={styles.metaDivider}>|</span>

                <span className={styles.category}>
                  {categoryOption?.label ?? recipe.category}
                </span>
              </div>

              <span className={styles.sellerNickname}>{seller.nickname}</span>
            </div>

            <div className={styles.sellerInfoContent}>
              <div className={styles.recipePreview}>
                <p className={styles.recipePreviewContent}>{recipe.content}</p>

                <button
                  type="button"
                  className={styles.moreButton}
                  onClick={() => setIsRecipeDetailOpen(true)}
                >
                  더보기
                </button>
              </div>

              <div className={styles.priceInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>가격</span>
                  <span className={styles.infoValue}>{listing.price} P</span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>잔여</span>
                  <span className={styles.infoValue}>
                    {listing.remainingQuantity}
                  </span>
                </div>
              </div>

              <section className={styles.sellerExchangeInfo}>
                <h2 className={styles.sellerExchangeTitle}>
                  <Image
                    src="/icons/reset.svg"
                    alt=""
                    width={40}
                    height={40}
                    className={styles.sellerExchangeIcon}
                  />
                  교환 희망 정보
                </h2>

                {isExchangeAvailable && (
                  <div className={styles.sellerWantedMeta}>
                    <span
                      className={`${styles.difficulty} ${wantedDifficultyClassName}`}
                    >
                      {wantedDifficultyOption?.label ??
                        listing.wantedDifficulty}
                    </span>

                    <span className={styles.metaDivider}>|</span>

                    <span className={styles.category}>
                      {wantedCategoryOption?.label ?? listing.wantedCategory}
                    </span>
                  </div>
                )}

                <p className={styles.sellerWantedDescription}>
                  {isExchangeAvailable
                    ? listing.wantedDescription
                    : '교환을 희망하지 않습니다.'}
                </p>
              </section>

              {isRecipeDetailOpen && (
                <section className={styles.recipeDetailPanel}>
                  <div className={styles.recipeDetailHeader}>
                    <h2
                      id="recipe-detail-title"
                      className={styles.recipeDetailTitle}
                    >
                      상세 레시피
                    </h2>

                    <button
                      type="button"
                      className={styles.recipeDetailCloseButton}
                      onClick={() => setIsRecipeDetailOpen(false)}
                      aria-label="상세 레시피 닫기"
                    >
                      <Image
                        src="/icons/close.svg"
                        alt=""
                        width={24}
                        height={24}
                      />
                    </button>
                  </div>

                  <div className={styles.recipeDetailBody}>
                    <div className={styles.ingredientSection}>
                      <p className={styles.ingredientText}>
                        <span className={styles.ingredientLabel}>재료:</span>{' '}
                        {recipe.ingredients
                          .map(
                            (ingredient) =>
                              `${ingredient.name} ${ingredient.amount}`,
                          )
                          .join(', ')}
                      </p>
                    </div>

                    <div className={styles.recipeContentSection}>
                      <p className={styles.fullRecipeContent}>
                        {recipe.content}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className={styles.sellerActions}>
              <Button type="button" className={styles.sellerActionButton}>
                수정하기
              </Button>

              <Button
                type="button"
                variant="secondary"
                className={styles.sellerActionButton}
              >
                판매 내리기
              </Button>

              <Button
                type="button"
                variant="secondary"
                className={`${styles.sellerActionButton} ${styles.deleteRecipeButton}`}
              >
                레시피 삭제하기
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.myTradeSection}>
          <h2 className={`${styles.tradeSectionTitle} font-baskin-robbins`}>
            교환 제시 목록
          </h2>

          <div className={styles.myTradeList}>
            {tradeOffers.map((tradeOffer) => {
              const offeredRecipe = tradeOffer.offeredCopy.recipe
              const offeredThumbnailUrl = offeredRecipe.imageUrls[0]
              const offeredDifficultyOption = DIFFICULTY_OPTIONS.find(
                (option) => option.value === offeredRecipe.difficulty,
              )

              const offeredCategoryOption = CATEGORY_OPTIONS.find(
                (option) => option.value === offeredRecipe.category,
              )

              const offeredDifficultyClassName =
                DIFFICULTY_CLASS_NAMES[offeredDifficultyOption?.tone] ?? ''

              return (
                <article key={tradeOffer.id} className={styles.tradeCard}>
                  <div className={styles.tradeImageWrapper}>
                    <Image
                      src={offeredThumbnailUrl}
                      alt={offeredRecipe.title}
                      fill
                      sizes="(max-width: 1023px) 50vw, 360px"
                      className={styles.tradeImage}
                    />
                  </div>

                  <h3 className={styles.tradeCardTitle}>
                    {offeredRecipe.title}
                  </h3>

                  <div className={styles.tradeCardMeta}>
                    <div className={styles.tradeRecipeMeta}>
                      <span
                        className={`${styles.difficulty} ${offeredDifficultyClassName}`}
                      >
                        {offeredDifficultyOption?.label ??
                          offeredRecipe.difficulty}
                      </span>

                      <span className={styles.metaDivider}>|</span>

                      <span className={styles.category}>
                        {offeredCategoryOption?.label ?? offeredRecipe.category}
                      </span>
                    </div>

                    <span className={styles.proposerNickname}>
                      {tradeOffer.proposer.nickname}
                    </span>
                  </div>

                  <p className={styles.tradeDescription}>
                    {tradeOffer.description}
                  </p>

                  <div className={styles.tradeActionButtons}>
                    <Button
                      type="button"
                      variant="secondary"
                      className={styles.rejectTradeButton}
                      onClick={() => setRejectTargetOffer(tradeOffer)}
                    >
                      거절하기
                    </Button>

                    <Button type="button" className={styles.approveTradeButton}>
                      승인하기
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
      <ActionConfirmModal
        isOpen={rejectTargetOffer !== null}
        onClose={() => setRejectTargetOffer(null)}
        onConfirm={handleRejectTradeOffer}
        title="교환 제시 거절"
        description={
          rejectTargetRecipe
            ? `[${rejectTargetDifficultyOption.label ?? rejectTargetRecipe.difficulty} | ${rejectTargetRecipe.title}] 카드와의 교환을 거절하시겠습니까?`
            : ''
        }

        confirmLabel="거절하기"
      />
    </main>
  )
}

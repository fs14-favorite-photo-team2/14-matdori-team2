'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useDeleteMarketListing,
  useUpdateMarketListing,
  useWithdrawMarketListing,
} from '@/features/marketplace/useMarketListingMutations'
import Image from 'next/image'
import styles from './page.module.css'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import Button from '@/components/common/Button/Button'
import MobileHeader from '@/components/layout/Header/MobileHeader/MobileHeader'
import ActionConfirmModal from '@/components/common/ActionConfirmModal/ActionConfirmModal'
import SaleEditModal from '@/features/sales/components/SaleEditModal/SaleEditModal'
import Toast from '@/components/common/Toast/Toast'
import useTimedToast from '@/hooks/useTimedToast'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import { useListingTradeOffers } from '@/features/exchanges/useTradeOffers'
import LoadingIndicator from '@/components/common/LoadingIndicator/LoadingIndicator'
import {
  useAcceptTradeOffer,
  useRejectTradeOffer,
} from '@/features/exchanges/useTradeOfferMutations'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { SALE_EDIT_DETAIL_ERROR_MATCHERS } from '@/constants/ApiErrorMessages'

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

const DEFAULT_THUMBNAIL_URL = '/images/default-recipe.png'

function TradeOfferThumbnail({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState(src || DEFAULT_THUMBNAIL_URL)

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="(max-width: 1023px) 50vw, 360px"
      className={className}
      onError={() => setImageSrc(DEFAULT_THUMBNAIL_URL)}
    />
  )
}

export default function SellerListingDetail({ listing }) {
  const { recipe, seller } = listing
  const router = useRouter()
  const withdrawMutation = useWithdrawMarketListing()
  const deleteMutation = useDeleteMarketListing()
  const updateMutation = useUpdateMarketListing()
  const rejectTradeOfferMutation = useRejectTradeOffer()
  const acceptTradeOfferMutation = useAcceptTradeOffer()
  const { toastMessage, showToast } = useTimedToast()

  const {
    tradeOffers,
    error: tradeOffersError,
    isPending: isTradeOffersPending,
    isError: isTradeOffersError,
    isRefetching: isTradeOffersRefetching,
    refetch: refetchTradeOffers,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useListingTradeOffers(
    listing.id,
    { status: 'PENDING' },
    { enabled: listing.listingType !== 'SALE' },
  )

  const tradeOfferSentinelRef = useInfiniteScroll({
    enabled: listing.listingType !== 'SALE' && !isFetchNextPageError,
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
  })

  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === recipe.difficulty,
  )

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === recipe.category,
  )

  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false)
  const [rejectTargetOffer, setRejectTargetOffer] = useState(null)
  const [approveTargetOffer, setApproveTargetOffer] = useState(null)
  const [isUnlistModalOpen, setIsUnlistModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const imageCount = recipe.imageUrls.length
  const currentImageUrl = imageLoadFailed
    ? DEFAULT_THUMBNAIL_URL
    : recipe.imageUrls[currentImageIndex] || DEFAULT_THUMBNAIL_URL
  const hasMultipleImages = imageCount > 1
  const isSoldOut =
    listing.status === 'SOLD_OUT' || listing.remainingQuantity === 0
  const isExchangeAvailable = listing.listingType === 'BOTH'

  function handlePreviousImage() {
    setImageLoadFailed(false)
    setCurrentImageIndex(
      (currentIndex) => (currentIndex - 1 + imageCount) % imageCount,
    )
  }

  function handleNextImage() {
    setImageLoadFailed(false)
    setCurrentImageIndex((currentIndex) => (currentIndex + 1) % imageCount)
  }

  function handleEditSubmit(editData) {
    if (updateMutation.isPending) return

    const data = {
      remainingQuantity: editData.quantity,
      price: editData.unitPrice,
      listingType: editData.listingType,
    }

    if (editData.listingType === 'BOTH') {
      data.wantedDifficulty = editData.desiredDifficulty
      data.wantedCategory = editData.desiredCategory
      data.wantedDescription = editData.exchangeDescription
    }

    updateMutation.mutate(
      {
        listingId: editData.listingId,
        data,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
        },

        onError: (error) => {
          showToast(
            getApiErrorMessage(
              error,
              '판매글을 수정하지 못했습니다.',
              SALE_EDIT_DETAIL_ERROR_MATCHERS,
            ),
          )
        },
      },
    )
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

  const approveTargetRecipe = approveTargetOffer?.offeredCopy.recipe

  const approveTargetDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === approveTargetRecipe?.difficulty,
  )

  function handleRejectTradeOffer() {
    if (!rejectTargetOffer || rejectTradeOfferMutation.isPending) return

    rejectTradeOfferMutation.mutate(
      {
        tradeOfferId: rejectTargetOffer.id,
        listingId: listing.id,
      },
      {
        onSuccess: () => {
          setRejectTargetOffer(null)
        },
        onError: (error) => {
          showToast(getApiErrorMessage(error))
        },
      },
    )
  }

  function handleApproveTradeOffer() {
    if (!approveTargetOffer || acceptTradeOfferMutation.isPending) return

    acceptTradeOfferMutation.mutate(
      {
        tradeOfferId: approveTargetOffer.id,
        listingId: listing.id,
      },
      {
        onSuccess: () => {
          setApproveTargetOffer(null)
        },
        onError: (error) => {
          showToast(getApiErrorMessage(error))
        },
      },
    )
  }

  function handleDeleteConfirm() {
    if (withdrawMutation.isPending || deleteMutation.isPending) return

    const removalMutation =
      listing.status === 'ON_SALE' ? withdrawMutation : deleteMutation

    removalMutation.mutate(listing.id, {
      onSuccess: () => {
        setIsUnlistModalOpen(false)
        router.replace('/marketplace')
      },

      onError: (error) => {
        showToast(getApiErrorMessage(error))
      },
    })
  }

  return (
    <main className={styles.page}>
      {toastMessage && (
        <div className={styles.toastWrapper}>
          <Toast message={toastMessage} />
        </div>
      )}
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
              onError={() => setImageLoadFailed(true)}
              className={`${styles.thumbnail} ${
                isSoldOut ? styles.soldOutImage : ''
              }`}
            />

            {isSoldOut && (
              <Image
                className={styles.soldOutBadge}
                src="/icons/sold-out.svg"
                alt="품절"
                width={160}
                height={160}
              />
            )}

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
                <p className={styles.recipePreviewContent}>
                  {recipe.content ?? recipe.summary}
                </p>

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
                        {recipe.content ?? recipe.summary}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className={styles.sellerActions}>
              <Button
                type="button"
                className={styles.sellerActionButton}
                onClick={() => setIsEditModalOpen(true)}
              >
                수정하기
              </Button>

              <Button
                type="button"
                variant="secondary"
                className={styles.sellerActionButton}
                onClick={() => setIsUnlistModalOpen(true)}
                disabled={
                  withdrawMutation.isPending || deleteMutation.isPending
                }
              >
                판매글 삭제하기
              </Button>
            </div>
          </div>
        </section>
        {isExchangeAvailable && (
          <section className={styles.myTradeSection}>
            <h2 className={`${styles.tradeSectionTitle} font-baskin-robbins`}>
              교환 제시 목록
            </h2>

            {isTradeOffersPending ? (
              <LoadingIndicator
                variant="page"
                message="교환 제안을 불러오는 중입니다"
              />
            ) : isTradeOffersError && tradeOffers.length === 0 ? (
              <div className={styles.tradeListError}>
                <p>
                  {getApiErrorMessage(
                    tradeOffersError,
                    '교환 제안을 불러오지 못했습니다.',
                  )}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => refetchTradeOffers()}
                  disabled={isTradeOffersRefetching}
                >
                  {isTradeOffersRefetching ? '불러오는 중...' : '다시 시도'}
                </Button>
              </div>
            ) : tradeOffers.length === 0 ? (
              <p className={styles.tradeListState}>
                아직 받은 교환 제안이 없습니다.
              </p>
            ) : (
              <>
                <div className={styles.myTradeList}>
                  {tradeOffers.map((tradeOffer) => {
                    const offeredRecipe = tradeOffer.offeredCopy.recipe
                    const offeredDifficultyOption = DIFFICULTY_OPTIONS.find(
                      (option) => option.value === offeredRecipe.difficulty,
                    )

                    const offeredCategoryOption = CATEGORY_OPTIONS.find(
                      (option) => option.value === offeredRecipe.category,
                    )

                    const offeredDifficultyClassName =
                      DIFFICULTY_CLASS_NAMES[offeredDifficultyOption?.tone] ??
                      ''

                    return (
                      <article key={tradeOffer.id} className={styles.tradeCard}>
                        <div className={styles.tradeImageWrapper}>
                          <TradeOfferThumbnail
                            src={offeredRecipe.imageUrls[0]}
                            alt={offeredRecipe.title}
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
                              {offeredCategoryOption?.label ??
                                offeredRecipe.category}
                            </span>
                          </div>

                          <span className={styles.proposerNickname}>
                            {tradeOffer.proposer.nickname}
                          </span>
                        </div>

                        <p className={styles.tradeDescription}>
                          {tradeOffer.message}
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

                          <Button
                            type="button"
                            className={styles.approveTradeButton}
                            onClick={() => setApproveTargetOffer(tradeOffer)}
                          >
                            승인하기
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {hasNextPage && (
                  <div
                    ref={tradeOfferSentinelRef}
                    className={styles.sentinel}
                  />
                )}

                {isFetchingNextPage && <LoadingIndicator variant="list" />}

                {isFetchNextPageError && (
                  <div className={styles.tradeListError}>
                    <p>
                      {getApiErrorMessage(
                        tradeOffersError,
                        '교환 제안을 더 불러오지 못했습니다.',
                      )}
                    </p>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      다시 시도
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
      <ActionConfirmModal
        isOpen={rejectTargetOffer !== null}
        onClose={() => setRejectTargetOffer(null)}
        onConfirm={handleRejectTradeOffer}
        title="교환 제시 거절"
        isPending={rejectTradeOfferMutation.isPending}
        description={
          rejectTargetRecipe
            ? `[${rejectTargetDifficultyOption?.label ?? rejectTargetRecipe.difficulty} | ${rejectTargetRecipe.title}] 카드와의 교환을 거절하시겠습니까?`
            : ''
        }

        confirmLabel="거절하기"
      />

      <ActionConfirmModal
        isOpen={approveTargetOffer !== null}
        onClose={() => setApproveTargetOffer(null)}
        onConfirm={handleApproveTradeOffer}
        title="교환 제시 승인"
        isPending={acceptTradeOfferMutation.isPending}
        description={
          approveTargetRecipe
            ? `[${approveTargetDifficultyOption?.label ?? approveTargetRecipe.difficulty} | ${approveTargetRecipe.title}] 카드와의 교환을 승인하시겠습니까?`
            : ''
        }

        confirmLabel="승인하기"
      />

      <ActionConfirmModal
        isOpen={isUnlistModalOpen}
        onClose={() => setIsUnlistModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="판매글 삭제하기"
        description="정말로 판매글을 삭제하시겠습니까?"
        confirmLabel="삭제하기"
        isPending={withdrawMutation.isPending || deleteMutation.isPending}
      />

      <SaleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        listing={listing}
        isPending={updateMutation.isPending}
      />
    </main>
  )
}

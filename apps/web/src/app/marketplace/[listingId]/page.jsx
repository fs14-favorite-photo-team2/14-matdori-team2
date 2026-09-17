'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePurchaseMarketListing } from '@/features/marketplace/useMarketListingMutations'
import ActionConfirmModal from '@/components/common/ActionConfirmModal/ActionConfirmModal'
import Toast from '@/components/common/Toast/Toast'
import useTimedToast from '@/hooks/useTimedToast'
import Image from 'next/image'
import Button from '@/components/common/Button/Button'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import RecipeSelectionModal from '@/components/common/RecipeSelectionModal/RecipeSelectionModal'
import ExchangeOfferModal from '@/features/exchanges/components/ExchangeOfferModal/ExchangeOfferModal'
import SellerListingDetail from './SellerListingDetail'
import MobileHeader from '@/components/layout/Header/MobileHeader/MobileHeader'
import ErrorState from '@/components/common/ErrorState/ErrorState'
import useCurrentUser from '@/features/auth/useCurrentUser'
import useMarketListing from '@/features/marketplace/useMarketListing'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import useMyRecipeCopies from '@/features/my-kitchen/useMyRecipeCopies'
import { useSentTradeOffers } from '@/features/exchanges/useTradeOffers'
import {
  useCancelTradeOffer,
  useCreateTradeOffer,
} from '@/features/exchanges/useTradeOfferMutations'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import styles from './page.module.css'

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

function MarketplaceListingContent({ listing, currentUserId }) {
  const isSeller = currentUserId === listing.seller.id
  const { recipe, seller } = listing
  const thumbnailUrl = recipe.imageUrls[0] || '/images/default-recipe.png'
  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === recipe.difficulty,
  )

  const router = useRouter()
  const purchaseMutation = usePurchaseMarketListing()
  const cancelTradeOfferMutation = useCancelTradeOffer()
  const createTradeOfferMutation = useCreateTradeOffer()

  const {
    tradeOffers: sentTradeOffers,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSentTradeOffers({ status: 'PENDING' }, { enabled: !isSeller })

  const tradeOffers = sentTradeOffers.filter(
    (tradeOffer) => Number(tradeOffer.listingId) === Number(listing.id),
  )
  const tradeOfferSentinelRef = useInfiniteScroll({
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
    enabled: !isSeller,
  })
  const { toastMessage, showToast } = useTimedToast()
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [cancelTargetOffer, setCancelTargetOffer] = useState(null)
  const [isExchangeSelectionOpen, setIsExchangeSelectionOpen] = useState(false)
  const [selectedExchangeRecipe, setSelectedExchangeRecipe] = useState(null)
  const [exchangeSearchInput, setExchangeSearchInput] = useState('')
  const [exchangeFilters, setExchangeFilters] = useState({
    difficulty: '',
    category: '',
  })

  const debouncedExchangeKeyword = useDebouncedValue(
    exchangeSearchInput.trim(),
    400,
  )

  const {
    recipeCopies,
    error: recipeCopiesError,
    isPending: isRecipeCopiesPending,
    isError: isRecipeCopiesError,
    hasNextPage: hasNextRecipeCopiesPage,
    isFetchingNextPage: isFetchingNextRecipeCopiesPage,
    isFetchNextPageError: isRecipeCopiesNextPageError,
    fetchNextPage: fetchNextRecipeCopiesPage,
  } = useMyRecipeCopies({
    limit: 10,
    state: 'OWNED',
    keyword: debouncedExchangeKeyword,
    difficulty: exchangeFilters.difficulty,
    category: exchangeFilters.category,
    enabled: !isSeller && isExchangeSelectionOpen,
  })

  useEffect(() => {
    if (!isRecipeCopiesError) return

    showToast(
      getApiErrorMessage(
        recipeCopiesError,
        '교환 가능한 레시피를 불러오지 못했습니다.',
      ),
    )
  }, [isRecipeCopiesError, recipeCopiesError, showToast])

  const exchangeableRecipes = useMemo(() => {
    const recipesById = new Map()

    for (const copy of recipeCopies) {
      const recipeId = copy.recipe.id
      const existingRecipe = recipesById.get(recipeId)

      if (existingRecipe) {
        existingRecipe.availableQuantity += 1
        continue
      }

      recipesById.set(recipeId, {
        recipeId,
        offeredCopyId: copy.id,
        creatorNickname: copy.recipe.creator?.nickname,
        title: copy.recipe.title,
        thumbnailUrl: copy.recipe.imageUrl,
        difficulty: copy.recipe.difficulty,
        category: copy.recipe.category,
        availableQuantity: 1,
      })
    }

    return Array.from(recipesById.values())
  }, [recipeCopies])

  // 구매 수량 UI가 연결되면 해당 상태값으로 교체
  const purchaseQuantity = 1

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === recipe.category,
  )

  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''

  const isSoldOut =
    listing.status === 'SOLD_OUT' || listing.remainingQuantity === 0

  const isExchangeAvailable = listing.listingType === 'BOTH'

  const wantedDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === listing.wantedDifficulty,
  )

  const wantedCategoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === listing.wantedCategory,
  )

  const wantedDifficultyClassName =
    DIFFICULTY_CLASS_NAMES[wantedDifficultyOption?.tone] ?? ''

  function handlePurchaseConfirm() {
    if (purchaseMutation.isPending) return

    purchaseMutation.mutate(listing.id, {
      onSuccess: () => {
        setIsPurchaseModalOpen(false)

        const params = new URLSearchParams({
          difficultyLabel: difficultyOption?.label ?? recipe.difficulty,
          title: recipe.title,
          quantity: String(purchaseQuantity),
        })

        router.push(
          `/marketplace/${listing.id}/purchase/success?${params.toString()}`,
        )
      },

      onError: (error) => {
        const status = error.response?.status

        if (!status || status >= 500) {
          setIsPurchaseModalOpen(false)
          router.push(`/marketplace/${listing.id}/purchase/failure`)
          return
        }

        showToast(getApiErrorMessage(error))
      },
    })
  }

  if (isSeller) {
    return <SellerListingDetail listing={listing} />
  }

  const cancelTargetRecipe = cancelTargetOffer?.offeredCopy.recipe

  const cancelTargetDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === cancelTargetRecipe?.difficulty,
  )

  function handleCancelTradeOffer() {
    if (!cancelTargetOffer || cancelTradeOfferMutation.isPending) return

    cancelTradeOfferMutation.mutate(
      {
        tradeOfferId: cancelTargetOffer.id,
        listingId: listing.id,
      },
      {
        onSuccess: () => {
          setCancelTargetOffer(null)
        },
        onError: (error) => {
          showToast(getApiErrorMessage(error))
        },
      },
    )
  }

  function handleCloseExchangeSelection() {
    setIsExchangeSelectionOpen(false)
    setSelectedExchangeRecipe(null)
  }

  function handleSelectExchangeRecipe(selectedRecipe) {
    setSelectedExchangeRecipe(selectedRecipe)
  }

  function handleCloseExchangeOffer() {
    setSelectedExchangeRecipe(null)
  }

  function handleExchangeSubmit({ recipe: offeredRecipe, description }) {
    if (createTradeOfferMutation.isPending) return

    createTradeOfferMutation.mutate(
      {
        listingId: listing.id,
        offeredCopyId: offeredRecipe.offeredCopyId,
        message: description,
      },
      {
        onSuccess: () => {
          const offeredDifficultyOption = DIFFICULTY_OPTIONS.find(
            (option) => option.value === offeredRecipe.difficulty,
          )

          const params = new URLSearchParams({
            difficultyLabel:
              offeredDifficultyOption?.label ?? offeredRecipe.difficulty,
            title: offeredRecipe.title,
          })

          setSelectedExchangeRecipe(null)
          setIsExchangeSelectionOpen(false)

          router.push(
            `/marketplace/${listing.id}/exchange/success?${params.toString()}`,
          )
        },

        onError: (error) => {
          const status = error.response?.status

          if (!status || status >= 500) {
            setSelectedExchangeRecipe(null)
            setIsExchangeSelectionOpen(false)
            router.push(`/marketplace/${listing.id}/exchange/failure`)
            return
          }

          showToast(getApiErrorMessage(error))
        },
      },
    )
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
              src={thumbnailUrl}
              alt={recipe.title}
              fill //화면 꽉채우기
              preload //우선순위
              sizes="(max-width: 743px) 100vw, (max-width: 1023px) 50vw, 780px"
              className={styles.thumbnail}
            />
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

            <div className={styles.summaryWrapper}>
              <p className={styles.summary}>{recipe.summary}</p>
            </div>

            <div className={styles.priceInfo}>
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>가격</div>
                <div className={styles.infoValue}>{listing.price} P</div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>잔여</span>
                <span className={styles.infoValue}>
                  {listing.remainingQuantity}
                </span>
              </div>
            </div>

            <Button
              type="button"
              className={styles.purchaseButton}
              disabled={isSoldOut}
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              레시피 구매하기
            </Button>
          </div>
        </section>

        <section className={styles.exchangeSection}>
          <div className={styles.exchangeHeader}>
            <h2 className={`${styles.exchangeTitle} font-baskin-robbins`}>
              교환 희망 정보
            </h2>

            <Button
              type="button"
              className={styles.exchangeButton}
              disabled={isSoldOut || !isExchangeAvailable}
              onClick={() => setIsExchangeSelectionOpen(true)}
            >
              레시피 교환하기
            </Button>
          </div>

          <div className={styles.exchangeContent}>
            <p className={styles.wantedDescription}>
              {isExchangeAvailable
                ? listing.wantedDescription
                : '교환을 희망하지 않습니다.'}
            </p>

            {isExchangeAvailable && (
              <div className={styles.wantedMeta}>
                <span
                  className={`${styles.difficulty} ${wantedDifficultyClassName}`}
                >
                  {wantedDifficultyOption?.label ?? listing.wantedDifficulty}
                </span>

                <span className={styles.metaDivider}>|</span>

                <span className={styles.category}>
                  {wantedCategoryOption?.label ?? listing.wantedCategory}
                </span>
              </div>
            )}
          </div>
        </section>

        {tradeOffers.length > 0 && (
          <section className={styles.myTradeSection}>
            <h2 className={`${styles.tradeSectionTitle} font-baskin-robbins`}>
              내가 제시한 교환 목록
            </h2>

            <div className={styles.myTradeList}>
              {tradeOffers.map((tradeOffer) => {
                const offeredRecipe = tradeOffer.offeredCopy.recipe
                const offeredThumbnailUrl =
                  offeredRecipe.imageUrls[0] || '/images/default-recipe.png'
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

                    <Button
                      type="button"
                      variant="secondary"
                      className={styles.cancelTradeButton}
                      onClick={() => setCancelTargetOffer(tradeOffer)}
                    >
                      취소하기
                    </Button>
                  </article>
                )
              })}
            </div>
          </section>
        )}
        <div ref={tradeOfferSentinelRef} className={styles.sentinel} />
      </div>
      <ActionConfirmModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handlePurchaseConfirm}
        title="레시피 구매"
        description={`[${difficultyOption?.label ?? recipe.difficulty} | ${recipe.title}] ${purchaseQuantity}장을 구매하시겠습니까?`}
        confirmLabel="구매하기"
        isPending={purchaseMutation.isPending}
      />

      <ActionConfirmModal
        isOpen={cancelTargetOffer !== null}
        onClose={() => setCancelTargetOffer(null)}
        onConfirm={handleCancelTradeOffer}
        title="교환 제시 취소"
        isPending={cancelTradeOfferMutation.isPending}
        description={
          cancelTargetRecipe
            ? `[${cancelTargetDifficultyOption?.label ?? cancelTargetRecipe.difficulty} | ${cancelTargetRecipe.title}] 교환 제시를 취소하시겠습니까?`
            : ''
        }
        confirmLabel="취소하기"
      />

      <RecipeSelectionModal
        isOpen={isExchangeSelectionOpen && selectedExchangeRecipe === null}
        onClose={handleCloseExchangeSelection}
        onSelectRecipe={handleSelectExchangeRecipe}
        recipes={exchangeableRecipes}
        title="레시피 교환하기"
        emptyMessage="교환 가능한 레시피가 없습니다."
        isLoading={isRecipeCopiesPending}
        hasNextPage={
          Boolean(hasNextRecipeCopiesPage) && !isRecipeCopiesNextPageError
        }
        isFetchingNextPage={isFetchingNextRecipeCopiesPage}
        onLoadMore={fetchNextRecipeCopiesPage}
        onSearchChange={setExchangeSearchInput}
        onFiltersChange={setExchangeFilters}
      />

      <ExchangeOfferModal
        key={selectedExchangeRecipe?.recipeId ?? 'empty'}
        isOpen={selectedExchangeRecipe !== null}
        onClose={handleCloseExchangeOffer}
        selectedRecipe={selectedExchangeRecipe}
        onSubmit={handleExchangeSubmit}
        isPending={createTradeOfferMutation.isPending}
      />
    </main>
  )
}

export default function MarketplaceListingPage() {
  const { listingId } = useParams()
  const { user, isLoading: isUserLoading } = useCurrentUser()

  const {
    data: listing,
    error,
    isConfigured,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useMarketListing(listingId)

  if (!isConfigured) {
    return (
      <ErrorState
        title="API 연결 정보가 없습니다."
        message="NEXT_PUBLIC_API_URL 환경변수를 확인해 주세요."
      />
    )
  }

  if (isPending || isUserLoading) {
    return (
      <ErrorState
        title="레시피 정보를 불러오는 중입니다."
        message="잠시만 기다려 주세요."
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="레시피 정보를 불러오지 못했습니다."
        message={getApiErrorMessage(error)}
        actionLabel="다시 시도"
        onAction={refetch}
        isActionLoading={isRefetching}
        actionLoadingLabel="불러오는 중..."
        hasNextPage={
          Boolean(hasNextRecipeCopiesPage) && !isRecipeCopiesNextPageError
        }
      />
    )
  }

  if (!listing) {
    return (
      <ErrorState
        title="레시피 정보를 찾을 수 없습니다."
        message="삭제됐거나 존재하지 않는 판매글입니다."
      />
    )
  }

  return (
    <MarketplaceListingContent listing={listing} currentUserId={user?.id} />
  )
}

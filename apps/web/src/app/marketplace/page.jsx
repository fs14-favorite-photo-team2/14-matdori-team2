'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/common/Button/Button'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import { DEFAULT_FILTERS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import { SORT_OPTIONS } from '@/constants/SortOptions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/common/Toast/Toast'
import useTimedToast from '@/hooks/useTimedToast'
import { useCreateMarketListing } from '@/features/marketplace/useMarketListingMutations'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import LoadingIndicator from '@/components/common/LoadingIndicator/LoadingIndicator'
import useMyRecipeCopies from '@/features/my-kitchen/useMyRecipeCopies'

import LoginRequiredModal from '@/features/auth/components/LoginRequiredModal/LoginRequiredModal'
import RecipeSelectionModal from '@/components/common/RecipeSelectionModal/RecipeSelectionModal'
import SaleRegistrationModal from '@/features/sales/components/SaleRegistrationModal/SaleRegistrationModal'
import RandomPointModal from '@/features/random-point/RandomPointModal'
import useMarketListings from '@/features/marketplace/useMarketListings'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import ErrorState from '@/components/common/ErrorState/ErrorState'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import useCurrentUser from '@/features/auth/useCurrentUser'
import ScrollToTopButton from '@/components/common/ScrollToTopButton/ScrollToTopButton'
import styles from './page.module.css'

const DESKTOP_PAGE_SIZE = 12
const TABLET_MOBILE_PAGE_SIZE = 8

export default function MarketplacePage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const debouncedKeyword = useDebouncedValue(searchInput.trim(), 400)
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FILTERS })
  const [sort, setSort] = useState('newest')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [pageSize, setPageSize] = useState(null)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [saleSearchInput, setSaleSearchInput] = useState('')
  const [saleFilters, setSaleFilters] = useState({
    difficulty: '',
    category: '',
  })
  const [isRandomPointModalOpen, setIsRandomPointModalOpen] = useState(false)
  const hasShownRandomPointModalRef = useRef(false)
  const createListingMutation = useCreateMarketListing()
  const { toastMessage, showToast } = useTimedToast()

  const {
    data: marketListingsData,
    error,
    isConfigured,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useMarketListings({
    limit: pageSize,
    keyword: debouncedKeyword,
    filters,
    sort,
    enabled: pageSize !== null,
  })

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isRefetching: isAuthRefetching,
    error: authError,
    refetch: refetchCurrentUser,
  } = useCurrentUser({
    enabled: isConfigured,
  })

  const debouncedSaleKeyword = useDebouncedValue(saleSearchInput.trim(), 400)

  const {
    recipeCopies: saleRecipeCopies,
    isPending: isSaleRecipesPending,
    hasNextPage: hasNextSaleRecipesPage,
    isFetchingNextPage: isFetchingNextSaleRecipesPage,
    isFetchNextPageError: isSaleRecipesNextPageError,
    fetchNextPage: fetchNextSaleRecipesPage,
  } = useMyRecipeCopies({
    limit: 10,
    state: 'OWNED',
    keyword: debouncedSaleKeyword,
    difficulty: saleFilters.difficulty,
    category: saleFilters.category,
    enabled: isSaleModalOpen && isAuthenticated,
  })

  const saleableRecipes = useMemo(() => {
    const recipesById = new Map()

    for (const copy of saleRecipeCopies) {
      const recipe = copy.recipe

      // 구매하거나 교환으로 받은 레시피는 재판매할 수 없으므로 제외합니다.
      if (recipe.creator?.id !== user?.id) continue

      const existingRecipe = recipesById.get(recipe.id)

      if (existingRecipe) {
        existingRecipe.recipeCopyIds.push(copy.id)
        existingRecipe.availableQuantity += 1
        continue
      }

      recipesById.set(recipe.id, {
        recipeId: recipe.id,
        recipeCopyIds: [copy.id],
        creatorId: recipe.creator.id,
        creatorNickname: recipe.creator.nickname,
        title: recipe.title,
        thumbnailUrl: recipe.imageUrl,
        difficulty: recipe.difficulty,
        category: recipe.category,
        availableQuantity: 1,
      })
    }

    return Array.from(recipesById.values())
  }, [saleRecipeCopies, user?.id])

  const marketListings =
    marketListingsData?.pages.flatMap((page) => page.data) ?? []
  const loadMoreRef = useInfiniteScroll({
    enabled: isConfigured && !isFetchNextPageError,
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
  })

  useEffect(() => {
    const tabletMediaQuery = window.matchMedia(`(max-width: 1023px)`)

    const handleScreenChange = () => {
      const nextPageSize = tabletMediaQuery.matches
        ? TABLET_MOBILE_PAGE_SIZE
        : DESKTOP_PAGE_SIZE

      setPageSize(nextPageSize)
    }

    handleScreenChange()
    tabletMediaQuery.addEventListener('change', handleScreenChange)

    return () => {
      tabletMediaQuery.removeEventListener('change', handleScreenChange)
    }
  }, [])

  // 로그인 상태가 확인되면 한 번만 랜덤 포인트 모달을 띄웁니다.
  useEffect(() => {
    if (isAuthLoading || isAuthRefetching) return
    if (!isAuthenticated) return
    if (hasShownRandomPointModalRef.current) return

    hasShownRandomPointModalRef.current = true
    setIsRandomPointModalOpen(true)
  }, [isAuthenticated, isAuthLoading, isAuthRefetching])

  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] =
    useState(false)

  async function handleSellButtonClick() {
    if (isAuthLoading || isAuthRefetching) {
      return
    }

    let isLoggedIn = isAuthenticated

    if (authError) {
      const result = await refetchCurrentUser()

      if (result.error) {
        return
      }

      isLoggedIn = Boolean(result.data)
    }

    if (!isLoggedIn) {
      setIsLoginRequiredModalOpen(true)
      return
    }

    setIsSaleModalOpen(true)
  }

  async function handleListingClick(event, listingId) {
    if (isAuthenticated && !authError && !isAuthLoading && !isAuthRefetching) {
      return
    }

    event.preventDefault()

    if (isAuthLoading || isAuthRefetching) {
      return
    }

    if (authError) {
      const result = await refetchCurrentUser()

      if (result.error) {
        return
      }

      if (result.data) {
        router.push(`/marketplace/${listingId}`)
        return
      }
    }

    setIsLoginRequiredModalOpen(true)
  }

  function handleSelectRecipe(recipe) {
    setSelectedRecipe(recipe)
  }

  function handleSaleRegistrationSubmit(saleData) {
    if (!selectedRecipe || createListingMutation.isPending) return

    const requestData = {
      recipeCopyIds: selectedRecipe.recipeCopyIds.slice(0, saleData.quantity),
      listingType: saleData.listingType,
      price: saleData.unitPrice,
    }

    if (saleData.listingType === 'BOTH') {
      requestData.wantedDifficulty = saleData.desiredDifficulty
      requestData.wantedCategory = saleData.desiredCategory
      requestData.wantedDescription = saleData.exchangeDescription
    }

    createListingMutation.mutate(requestData, {
      onSuccess: () => {
        const difficultyOption = DIFFICULTY_OPTIONS.find(
          (option) => option.value === selectedRecipe.difficulty,
        )

        const params = new URLSearchParams({
          difficultyLabel: difficultyOption?.label ?? selectedRecipe.difficulty,
          title: selectedRecipe.title,
        })

        setSelectedRecipe(null)
        setIsSaleModalOpen(false)

        router.push(`/my-sales/register/success?${params.toString()}`)
      },

      onError: (error) => {
        const status = error.response?.status

        if (!status || status >= 500) {
          setSelectedRecipe(null)
          setIsSaleModalOpen(false)
          router.push('/my-sales/register/failure')
          return
        }

        showToast(getApiErrorMessage(error, '판매글을 등록하지 못했습니다.'))
      },
    })
  }

  const handleFilterChange = (groupKey, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [groupKey]: value,
    }))
  }

  const handleDraftFilterChange = (groupKey, value) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [groupKey]: currentFilters[groupKey] === value ? '' : value,
    }))
  }

  const handleOpenMobile = () => {
    setDraftFilters({ ...filters })
    setIsMobileOpen(true)
  }

  const handleApply = (nextFilters) => {
    setFilters({ ...nextFilters })
    setIsMobileOpen(false)
  }

  const handleSortChange = (value) => {
    setSort(value)
  }

  if (!isConfigured) {
    return (
      <ErrorState
        title="API 연결 정보가 없습니다."
        message="NEXT_PUBLIC_API_URL 환경변수를 확인해 주세요."
      />
    )
  }

  if (isError && marketListings.length === 0) {
    return (
      <ErrorState
        title="마켓플레이스를 불러오지 못했습니다."
        message={getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.')}
        actionLabel="다시 시도"
        onAction={refetch}
        isActionLoading={isRefetching}
        actionLoadingLabel="불러오는 중..."
      />
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
        <header className={styles.pageHeader}>
          <h1 className={`${styles.title} font-baskin-robbins`}>
            마켓플레이스
          </h1>
          <Button
            type="button"
            className={styles.sellButton}
            onClick={handleSellButtonClick}
            disabled={isAuthLoading || isAuthRefetching}
          >
            {isAuthLoading || isAuthRefetching
              ? '로그인 확인 중...'
              : '나의 레시피 판매하기'}
          </Button>
        </header>

        <section className={styles.controls}>
          <div className={styles.searchArea}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="검색"
            />
          </div>

          <div className={styles.filterArea}>
            <RecipeFilter
              filters={filters}
              draftFilters={draftFilters}
              sortOptions={SORT_OPTIONS}
              sort={sort}
              isMobileOpen={isMobileOpen}
              onFilterChange={handleFilterChange}
              onDraftFilterChange={handleDraftFilterChange}
              onSortChange={handleSortChange}
              onOpenMobile={handleOpenMobile}
              onCloseMobile={() => setIsMobileOpen(false)}
              onReset={() => setDraftFilters({ ...DEFAULT_FILTERS })}
              onApply={handleApply}
            />
          </div>
        </section>

        {isPending ? (
          <LoadingIndicator
            variant="page"
            message="레시피를 불러오는 중입니다"
          />
        ) : marketListings.length === 0 ? (
          <p className={styles.listState}>조건에 맞는 레시피가 없습니다.</p>
        ) : (
          <>
            <section className={styles.cardGrid}>
              {marketListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className={styles.cardLink}
                  onClick={(event) => handleListingClick(event, listing.id)}
                >
                  <RecipeCard
                    thumbnailUrl={listing.recipe.imageUrl}
                    title={listing.recipe.title}
                    difficulty={listing.recipe.difficulty}
                    category={listing.recipe.category}
                    sellerNickname={listing.seller.nickname}
                    price={listing.price}
                    remainingQuantity={listing.remainingQuantity}
                    listingStatus={listing.status}
                  />
                </Link>
              ))}
            </section>

            {hasNextPage && (
              <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
            )}

            {isFetchingNextPage && <LoadingIndicator variant="list" />}

            {isFetchNextPageError && (
              <div className={styles.nextPageError}>
                <p>
                  {getApiErrorMessage(
                    error,
                    '레시피를 더 불러오지 못했습니다.',
                  )}
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fetchNextPage()}
                >
                  다시 시도
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTopButton />

      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
      />
      <RecipeSelectionModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSelectRecipe={handleSelectRecipe}
        recipes={saleableRecipes}
        title="나의 레시피 판매하기"
        emptyMessage="판매 가능한 레시피가 없습니다."
        isLoading={isSaleRecipesPending}
        hasNextPage={
          Boolean(hasNextSaleRecipesPage) && !isSaleRecipesNextPageError
        }
        isFetchingNextPage={isFetchingNextSaleRecipesPage}
        onLoadMore={fetchNextSaleRecipesPage}
        onSearchChange={setSaleSearchInput}
        onFiltersChange={setSaleFilters}
      />
      <SaleRegistrationModal
        key={selectedRecipe?.recipeId ?? 'empty'}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        isPending={createListingMutation.isPending}
        selectedRecipe={selectedRecipe}
        onSubmit={handleSaleRegistrationSubmit}
      />
      <RandomPointModal
        isOpen={isRandomPointModalOpen}
        onClose={() => setIsRandomPointModalOpen(false)}
        onClaimed={(currentPoints) => {}}
      />
    </main>
  )
}

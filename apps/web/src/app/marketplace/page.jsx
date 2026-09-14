'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/common/Button/Button'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import { DEFAULT_FILTERS } from '@/constants/RecipeOptions'
import { SORT_OPTIONS } from '@/constants/SortOptions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import {
  MOCK_REGISTERED_LISTINGS_KEY,
  MOCK_SALEABLE_RECIPES,
} from '@/features/marketplace/mockOwnedRecipes'
import LoginRequiredModal from '@/features/auth/components/LoginRequiredModal/LoginRequiredModal'
import RecipeSelectionModal from '@/components/common/RecipeSelectionModal/RecipeSelectionModal'
import SaleRegistrationModal from '@/features/sales/components/SaleRegistrationModal/SaleRegistrationModal'
import useMarketListings from '@/features/marketplace/useMarketListings'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import ErrorState from '@/components/common/ErrorState/ErrorState'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import useCurrentUser from '@/features/auth/useCurrentUser'
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
    isAuthenticated,
    isLoading: isAuthLoading,
    isRefetching: isAuthRefetching,
    error: authError,
    refetch: refetchCurrentUser,
  } = useCurrentUser({
    enabled: isConfigured,
  })

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
    const recipeToSell = selectedRecipe

    if (!recipeToSell) return

    const now = new Date().toISOString()

    const newListing = {
      id: Date.now(),
      recipe: {
        id: recipeToSell.recipeId,
        title: recipeToSell.title,
        thumbnailUrl: recipeToSell.thumbnailUrl,
        difficulty: recipeToSell.difficulty,
        category: recipeToSell.category,
        summary: recipeToSell.summary ?? '',
        minPrice: saleData.unitPrice,
      },
      seller: {
        id: recipeToSell.creatorId,
        nickname: recipeToSell.creatorNickname,
      },
      listingType: saleData.listingType,
      price: saleData.unitPrice,
      initialQuantity: saleData.quantity,
      remainingQuantity: saleData.quantity,
      wantedDifficulty: saleData.desiredDifficulty,
      wantedCategory: saleData.desiredCategory,
      wantedDescription: saleData.exchangeDescription,
      status: 'ON_SALE',
      createdAt: now,
      updatedAt: now,
    }

    const savedListings = JSON.parse(
      localStorage.getItem(MOCK_REGISTERED_LISTINGS_KEY) ?? '[]',
    )

    localStorage.setItem(
      MOCK_REGISTERED_LISTINGS_KEY,
      JSON.stringify([newListing, ...savedListings]),
    )

    setSelectedRecipe(null)
    setIsSaleModalOpen(false)

    router.push('/my-sales/register/success')
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
          <p className={styles.listState}>레시피를 불러오는 중...</p>
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

            {isFetchingNextPage && (
              <p className={styles.nextPageState}>레시피를 더 불러오는 중...</p>
            )}

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
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
      />
      <RecipeSelectionModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSelectRecipe={handleSelectRecipe}
        recipes={MOCK_SALEABLE_RECIPES}
        title="나의 레시피 판매하기"
        emptyMessage="판매 가능한 레시피가 없습니다."
      />
      <SaleRegistrationModal
        key={selectedRecipe?.recipeId ?? 'empty'}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        selectedRecipe={selectedRecipe}
        onSubmit={handleSaleRegistrationSubmit}
      />
    </main>
  )
}

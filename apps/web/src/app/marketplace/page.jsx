'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/common/Button/Button'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import { DEFAULT_FILTERS } from '@/constants/RecipeOptions'
import { SORT_OPTIONS } from '@/constants/SortOptions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import { MOCK_MARKET_LISTINGS } from '@/features/marketplace/mockListings'
import { MOCK_REGISTERED_LISTINGS_KEY } from '@/features/sales/mockSaleableRecipes'
import LoginRequiredModal from '@/features/auth/components/LoginRequiredModal/LoginRequiredModal'
import SaleRecipeSelectionModal from '@/features/sales/components/SaleRecipeSelectionModal/SaleRecipeSelectionModal'
import SaleRegistrationModal from '@/features/sales/components/SaleRegistrationModal/SaleRegistrationModal'
import styles from './page.module.css'

const DESKTOP_PAGE_SIZE = 12
const TABLET_MOBILE_PAGE_SIZE = 8

const MOCK_IS_LOGGED_IN = true

function getFilteredListings(listings, keyword, selectedFilters) {
  return listings.filter((listing) => {
    const recipeTitle = listing.recipe.title.toLowerCase()
    const normalizedKeyword = keyword.toLowerCase()

    const matchesKeyword = recipeTitle.includes(normalizedKeyword)

    const matchesDifficulty =
      !selectedFilters.difficulty ||
      listing.recipe.difficulty === selectedFilters.difficulty

    const matchesCategory =
      !selectedFilters.category ||
      listing.recipe.category === selectedFilters.category

    const matchesStatus =
      !selectedFilters.status || listing.status === selectedFilters.status

    return (
      matchesKeyword && matchesDifficulty && matchesCategory && matchesStatus
    )
  })
}

export default function MarketplacePage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FILTERS })
  const [sort, setSort] = useState('newest')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE)
  const [visibleCount, setVisibleCount] = useState(DESKTOP_PAGE_SIZE)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [marketListings, setMarketListings] = useState(MOCK_MARKET_LISTINGS)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    let frameId

    try {
      const savedListings = JSON.parse(
        localStorage.getItem(MOCK_REGISTERED_LISTINGS_KEY) ?? '[]',
      )

      if (!Array.isArray(savedListings)) return undefined

      frameId = window.requestAnimationFrame(() => {
        setMarketListings([...savedListings, ...MOCK_MARKET_LISTINGS])
      })
    } catch (error) {
      console.error('목 판매 목록을 불러오지 못했습니다.', error)
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const tabletMediaQuery = window.matchMedia(`(max-width: 1023px)`)

    const handleScreenChange = () => {
      const nextPageSize = tabletMediaQuery.matches
        ? TABLET_MOBILE_PAGE_SIZE
        : DESKTOP_PAGE_SIZE

      setPageSize(nextPageSize)
      setVisibleCount(nextPageSize)
    }

    handleScreenChange()
    tabletMediaQuery.addEventListener('change', handleScreenChange)

    return () => {
      tabletMediaQuery.removeEventListener('change', handleScreenChange)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchKeyword(searchInput.trim())
      setVisibleCount(pageSize)
    }, 400)

    return () => {
      clearTimeout(debounceTimer)
    }
  }, [pageSize, searchInput])

  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] =
    useState(false)

  function handleSellButtonClick() {
    if (!MOCK_IS_LOGGED_IN) {
      setIsLoginRequiredModalOpen(true)
      return
    }

    setIsSaleModalOpen(true)
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
    setVisibleCount(pageSize)
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
    setVisibleCount(pageSize)
  }

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    setVisibleCount(pageSize)
  }

  const handleSortChange = (value) => {
    setSort(value)
    setVisibleCount(pageSize)
  }

  const filteredListings = getFilteredListings(
    marketListings,
    searchKeyword,
    filters,
  )

  const draftFilteredListings = getFilteredListings(
    marketListings,
    searchKeyword,
    draftFilters,
  )

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sort === 'price_asc') {
      return a.price - b.price
    }

    if (sort === 'price_desc') {
      return b.price - a.price
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const visibleListings = sortedListings.slice(0, visibleCount)
  const hasMoreListings = visibleCount < sortedListings.length

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current

    if (!loadMoreElement || !hasMoreListings) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((currentCount) =>
          Math.min(currentCount + pageSize, sortedListings.length),
        )
      }
    })

    observer.observe(loadMoreElement)

    return () => {
      observer.disconnect()
    }
  }, [hasMoreListings, pageSize, sortedListings.length])

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
          >
            나의 레시피 판매하기
          </Button>
        </header>

        <section className={styles.controls}>
          <div className={styles.searchArea}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
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
              resultCount={draftFilteredListings.length}
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

        <section className={styles.cardGrid}>
          {visibleListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className={styles.cardLink}
            >
              <RecipeCard
                thumbnailUrl={listing.recipe.thumbnailUrl}
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

        {hasMoreListings && (
          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
        )}
      </div>
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
      />
      <SaleRecipeSelectionModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSelectRecipe={handleSelectRecipe}
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

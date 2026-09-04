'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/common/Button/Button'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import { DEFAULT_FILTERS } from '@/constants/RecipeOptions'
import { SORT_OPTIONS } from '@/constants/SortOptions'
import Link from 'next/link'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import {
  MOCK_FILTER_COUNTS,
  MOCK_MARKET_LISTINGS,
} from '@/features/marketplace/mockListings'
import styles from './page.module.css'

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
  const [searchInput, setSearchInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FILTERS })
  const [sort, setSort] = useState('newest')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchKeyword(searchInput.trim())
    }, 400)

    return () => {
      clearTimeout(debounceTimer)
    }
  }, [searchInput])

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

  const filteredListings = getFilteredListings(
    MOCK_MARKET_LISTINGS,
    searchKeyword,
    filters,
  )

  const draftFilteredListings = getFilteredListings(
    MOCK_MARKET_LISTINGS,
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

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={`${styles.title} font-baskin-robbins`}>
            마켓플레이스
          </h1>
          <Button className={styles.sellButton}>나의 레시피 판매하기</Button>
        </header>

        <section className={styles.controls}>
          <div className={styles.searchArea}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={setSearchKeyword}
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
              counts={MOCK_FILTER_COUNTS}
              resultCount={draftFilteredListings.length}
              onFilterChange={handleFilterChange}
              onDraftFilterChange={handleDraftFilterChange}
              onSortChange={setSort}
              onOpenMobile={handleOpenMobile}
              onCloseMobile={() => setIsMobileOpen(false)}
              onReset={() => setDraftFilters({ ...DEFAULT_FILTERS })}
              onApply={handleApply}
            />
          </div>
        </section>

        <section className={styles.cardGrid}>
          {sortedListings.map((listing) => (
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
      </div>
    </main>
  )
}

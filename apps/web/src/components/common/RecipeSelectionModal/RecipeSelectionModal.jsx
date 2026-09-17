'use client'

import { useRef, useState } from 'react'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import Modal from '@/components/common/Modal/Modal'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import ScrollToTopButton from '@/components/common/ScrollToTopButton/ScrollToTopButton'
import scrollTopStyles from '@/components/common/ScrollToTopButton/ScrollToTopButton.module.css'
import {
  DEFAULT_FILTERS,
  MY_KITCHEN_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './RecipeSelectionModal.module.css'

const PAGE_SIZE = 10

function getFilteredRecipes(recipes, keyword, selectedFilters) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return recipes.filter((recipe) => {
    const matchesKeyword = recipe.title
      .toLowerCase()
      .includes(normalizedKeyword)

    const matchesDifficulty =
      !selectedFilters.difficulty ||
      recipe.difficulty === selectedFilters.difficulty

    const matchesCategory =
      !selectedFilters.category || recipe.category === selectedFilters.category

    return matchesKeyword && matchesDifficulty && matchesCategory
  })
}

export default function RecipeSelectionModal({
  isOpen,
  onClose,
  onSelectRecipe,
  recipes = [],
  title,
  emptyMessage,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onSearchChange,
  onFiltersChange,
}) {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FILTERS })
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const modalScrollRef = useRef(null)
  const filteredRecipes = getFilteredRecipes(recipes, searchInput, filters)

  const draftFilteredRecipes = getFilteredRecipes(
    recipes,
    searchInput,
    draftFilters,
  )

  const visibleRecipes = filteredRecipes.slice(0, visibleCount)
  const hasMoreVisibleRecipes = visibleCount < filteredRecipes.length
  const hasMoreRecipes = hasMoreVisibleRecipes || hasNextPage

  const loadMoreRef = useInfiniteScroll({
    enabled: isOpen,
    hasMore: hasMoreRecipes,
    isLoading: isFetchingNextPage,
    rootRef: modalScrollRef,
    rootMargin: '100px',
    onLoadMore: () => {
      if (hasMoreVisibleRecipes) {
        setVisibleCount((currentCount) =>
          Math.min(currentCount + PAGE_SIZE, filteredRecipes.length),
        )
        return
      }

      onLoadMore?.()
    },
  })

  function handleSearchInputChange(value) {
    setSearchInput(value)
    setVisibleCount(PAGE_SIZE)
    onSearchChange?.(value)
  }

  function handleOpenMobileFilter() {
    setDraftFilters(filters)
    setIsMobileFilterOpen(true)
  }

  function handleApplyFilter(nextFilter) {
    setFilters(nextFilter)
    setVisibleCount(PAGE_SIZE)
    setIsMobileFilterOpen(false)
    onFiltersChange?.(nextFilter)
  }

  function handleResetFilter() {
    setDraftFilters({ ...DEFAULT_FILTERS })
  }

  function handleFilterChange(key, value) {
    setFilters((currentFilters) => {
      const nextFilters = {
        ...currentFilters,
        [key]: value,
      }

      onFiltersChange?.(nextFilters)

      return nextFilters
    })

    setVisibleCount(PAGE_SIZE)
  }

  // 적용되어 있는 필터를 또 누르면 풀리고, 적용 X 면 적용
  function handleDraftFilterChange(key, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [key]: currentFilters[key] === value ? '' : value,
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="large"
      ariaLabel={title}
      dialogRef={modalScrollRef}
    >
      <header className={styles.header}>
        <p className={`${styles.pageLabel} font-baskin-robbins`}>마이 키친</p>

        <h2 className={`${styles.title} font-baskin-robbins`}>{title}</h2>
      </header>

      <section className={styles.controls}>
        <div className={styles.searchArea}>
          <SearchBar
            value={searchInput}
            onChange={handleSearchInputChange}
            onSearch={handleSearchInputChange}
            placeholder="검색"
          />
        </div>

        <div className={styles.filterArea}>
          <RecipeFilter
            filterGroups={MY_KITCHEN_FILTER_GROUPS}
            filters={filters}
            draftFilters={draftFilters}
            isMobileOpen={isMobileFilterOpen}
            resultCount={draftFilteredRecipes.length}
            onFilterChange={handleFilterChange}
            onDraftFilterChange={handleDraftFilterChange}
            onOpenMobile={handleOpenMobileFilter}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            onReset={handleResetFilter}
            onApply={handleApplyFilter}
          />
        </div>
      </section>

      {isLoading && visibleRecipes.length === 0 ? (
        <p className={styles.emptyText}>레시피를 불러오는 중...</p>
      ) : visibleRecipes.length === 0 ? (
        <p className={styles.emptyText}>{emptyMessage}</p>
      ) : (
        <section className={styles.recipeGrid}>
          {visibleRecipes.map((recipe) => (
            <button
              type="button"
              className={styles.recipeCardButton}
              key={recipe.recipeId}
              onClick={() => onSelectRecipe(recipe)}
            >
              <RecipeCard
                thumbnailUrl={recipe.thumbnailUrl}
                title={recipe.title}
                difficulty={recipe.difficulty}
                category={recipe.category}
                sellerNickname={recipe.creatorNickname}
                remainingQuantity={recipe.availableQuantity}
                quantityLabel="수량"
              />
            </button>
          ))}
        </section>
      )}

      {hasMoreRecipes && (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      )}
      {isFetchingNextPage && (
        <p className={styles.emptyText}>레시피를 더 불러오는 중...</p>
      )}

      <ScrollToTopButton
        scrollTargetRef={modalScrollRef}
        className={scrollTopStyles.inModal}
      />
    </Modal>
  )
}

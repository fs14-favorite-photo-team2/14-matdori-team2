'use client'

import { useEffect, useRef, useState } from 'react'
import Modal from '@/components/common/Modal/Modal'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import { MOCK_SALEABLE_RECIPES } from '../../mockSaleableRecipes'
import {
  DEFAULT_FILTERS,
  MY_KITCHEN_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './SaleRecipeSelectionModal.module.css'

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

export default function SaleRecipeSelectionModal({
  isOpen,
  onClose,
  onSelectRecipe,
}) {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FILTERS })
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const modalScrollRef = useRef(null)
  const loadMoreRef = useRef(null)

  const filteredRecipes = getFilteredRecipes(
    MOCK_SALEABLE_RECIPES,
    searchInput,
    filters,
  )

  const draftFilteredRecipes = getFilteredRecipes(
    MOCK_SALEABLE_RECIPES,
    searchInput,
    draftFilters,
  )

  const visibleRecipes = filteredRecipes.slice(0, visibleCount)
  const hasMoreRecipes = visibleCount < filteredRecipes.length

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current

    if (!isOpen || !loadMoreElement || !hasMoreRecipes) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) =>
            Math.min(currentCount + PAGE_SIZE, filteredRecipes.length),
          )
        }
      }, // 제일아래 카드의 100px 위에를 추가 렌더링 기준 지점으로 삼음
      {
        root: modalScrollRef.current,
        rootMargin: '100px',
      },
    )

    observer.observe(loadMoreElement)

    return () => {
      observer.disconnect()
    }
  }, [filteredRecipes.length, hasMoreRecipes, isOpen])

  function handleSearchInputChange(value) {
    setSearchInput(value)
    setVisibleCount(PAGE_SIZE)
  }

  function handleOpenMobileFilter() {
    setDraftFilters(filters)
    setIsMobileFilterOpen(true)
  }

  function handleApplyFilter(nextFilter) {
    setFilters(nextFilter)
    setVisibleCount(PAGE_SIZE)
    setIsMobileFilterOpen(false)
  }

  function handleResetFilter() {
    setDraftFilters({ ...DEFAULT_FILTERS })
  }

  function handleFilterChange(key, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
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
      ariaLabel="나의 레시피 판매하기"
      dialogRef={modalScrollRef}
    >
      <header className={styles.header}>
        <p className={`${styles.pageLabel} font-baskin-robbins`}>마이 키친</p>

        <h2 className={`${styles.title} font-baskin-robbins`}>
          나의 레시피 판매하기
        </h2>
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

      {visibleRecipes.length === 0 ? (
        <p className={styles.emptyText}>판매 가능한 레시피가 없습니다.</p>
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
    </Modal>
  )
}

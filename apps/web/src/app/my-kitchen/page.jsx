'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import Button from '@/components/common/Button/Button'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import { fetchMyRecipeCopies } from '@/features/my-kitchen/api/recipeCopies'
import { queryKeys } from '@/lib/queryKeys'
import useCurrentUser from '@/features/auth/useCurrentUser'
import ScrollToTopButton from '@/components/common/ScrollToTopButton/ScrollToTopButton'
import {
  DIFFICULTY_OPTIONS,
  DEFAULT_FILTERS,
  MY_KITCHEN_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './page.module.css'

const PAGE_SIZE_DESKTOP = 12
const PAGE_SIZE_MOBILE = 8
const DESKTOP_BREAKPOINT = 1023

const DIFFICULTY_TONE_VARS = {
  easy: 'var(--color-main)',
  normal: 'var(--color-blue)',
  hard: 'var(--color-purple)',
  master: 'var(--color-pink)',
}

function groupByRecipe(copies) {
  const groups = new Map()

  for (const item of copies) {
    const recipeId = item.recipe.id
    const existing = groups.get(recipeId)

    if (existing) {
      existing.quantity += 1
    } else {
      groups.set(recipeId, { id: recipeId, recipe: item.recipe, quantity: 1 })
    }
  }

  return Array.from(groups.values())
}

export default function MyKitchenPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser()
  const nickname = user?.nickname ?? ''

  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP)
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const sentinelRef = useRef(null)

  useEffect(() => {
    function applySize() {
      const isMobile = window.innerWidth <= DESKTOP_BREAKPOINT
      setPageSize(isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP)
    }

    applySize()
    window.addEventListener('resize', applySize)
    return () => window.removeEventListener('resize', applySize)
  }, [])

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.myKitchen.list({
      keyword,
      difficulty: filters.difficulty,
      category: filters.category,
      pageSize,
    }),
    queryFn: ({ pageParam }) =>
      fetchMyRecipeCopies({
        state: 'OWNED',
        keyword: keyword.trim() || undefined,
        difficulty: filters.difficulty || undefined,
        category: filters.category || undefined,
        cursor: pageParam,
        limit: pageSize,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
  })

  const copies = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  )

  const groupedRecipes = useMemo(() => groupByRecipe(copies), [copies])

  const difficultyCounts = useMemo(() => {
    return DIFFICULTY_OPTIONS.map((option) => ({
      label: option.label,
      color: DIFFICULTY_TONE_VARS[option.tone],
      count: copies.filter((c) => c.recipe.difficulty === option.value).length,
    }))
  }, [copies])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleDraftFilterChange(key, value) {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value,
    }))
  }

  function handleOpenMobile() {
    setDraftFilters(filters)
    setIsMobileOpen(true)
  }

  function handleCloseMobile() {
    setIsMobileOpen(false)
  }

  function handleReset() {
    setDraftFilters(DEFAULT_FILTERS)
  }

  function handleApply(nextFilters) {
    setFilters(nextFilters)
    setIsMobileOpen(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={`${styles.pageTitle} font-baskin-robbins`}>마이 키친</h1>

        <Link href="/my-kitchen/create" className={styles.createButton}>
          <Button variant="primary">레시피 생성하기</Button>
        </Link>
      </div>

      <div className={styles.summarySection}>
        {!isUserLoading && (
          <p className={styles.summaryText}>
            {nickname}님이 보유한 레시피{' '}
            <span className={styles.summaryCount}>({copies.length}장)</span>
          </p>
        )}

        <div className={styles.chips}>
          {difficultyCounts.map((item) => (
            <span
              key={item.label}
              className={styles.chip}
              style={{ borderColor: item.color, color: item.color }}
            >
              {item.label} {item.count}장
            </span>
          ))}
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchField}>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            onSearch={setKeyword}
            placeholder="검색"
          />
        </div>

        <div className={styles.filterTrigger}>
          <RecipeFilter
            filterGroups={MY_KITCHEN_FILTER_GROUPS}
            filters={filters}
            draftFilters={draftFilters}
            isMobileOpen={isMobileOpen}
            resultCount={groupedRecipes.length}
            onFilterChange={handleFilterChange}
            onDraftFilterChange={handleDraftFilterChange}
            onOpenMobile={handleOpenMobile}
            onCloseMobile={handleCloseMobile}
            onReset={handleReset}
            onApply={handleApply}
          />
        </div>
      </div>

      {error && (
        <p className={styles.emptyText}>
          {error.response?.data?.error?.message ??
            '레시피 목록을 불러오지 못했어요.'}
        </p>
      )}

      {!error && groupedRecipes.length === 0 && !isLoading ? (
        <p className={styles.emptyText}>조건에 맞는 레시피가 없어요.</p>
      ) : (
        <div className={styles.grid}>
          {groupedRecipes.map((item) => (
            <RecipeCard
              key={item.id}
              thumbnailUrl={item.recipe.imageUrl}
              title={item.recipe.title}
              difficulty={item.recipe.difficulty}
              category={item.recipe.category}
              remainingQuantity={item.quantity}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className={styles.sentinel} />
      <ScrollToTopButton />
    </div>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import {
  DIFFICULTY_OPTIONS,
  DEFAULT_FILTERS,
  MY_SALES_FILTER_GROUPS,
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

// ---- GET /api/users/me/market-listings 로 교체 ----
const RECIPE_NAMES_BY_CATEGORY = {
  KOREAN: ['김치찌개', '된장찌개', '제육볶음', '불고기', '비빔밥'],
  WESTERN: ['토마토 파스타', '크림 파스타', '스테이크', '리조또'],
  JAPANESE: ['가츠동', '오코노미야키', '카레라이스'],
  ASIAN: ['팟타이', '쌀국수', '분짜'],
  HOME_BAKING: ['휘낭시에', '스콘', '브라우니'],
}
const CATEGORY_KEYS = Object.keys(RECIPE_NAMES_BY_CATEGORY)
const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'MASTER']

function createMockListings(count) {
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORY_KEYS[i % CATEGORY_KEYS.length]
    const names = RECIPE_NAMES_BY_CATEGORY[category]
    const difficulty = DIFFICULTIES[i % DIFFICULTIES.length]
    const isSoldOut = i % 4 === 0
    const isExchangePending = !isSoldOut && i % 5 === 0
    const listingType = isExchangePending ? 'EXCHANGE' : 'SALE'

    let badgeType
    if (!isSoldOut) {
      badgeType = isExchangePending ? 'exchangePending' : 'selling'
    }

    return {
      id: `listing-${i}`,
      badgeType,
      listingType,
      listingStatus: isSoldOut ? 'SOLD_OUT' : 'ON_SALE',
      recipe: {
        id: `recipe-${i}`,
        title: names[i % names.length],
        imageUrl: `https://picsum.photos/seed/listing-${i}/800/600`,
        difficulty,
        category,
        minPrice: 1000 + (i % 10) * 500,
      },
      remainingQuantity: isSoldOut ? 0 : (i % 3) + 1,
    }
  })
}
// ---------------------------------------------------------

function getFilteredListings(listings, keyword, targetFilters) {
  return listings.filter((item) => {
    const matchesKeyword = item.recipe.title.includes(keyword.trim())
    const matchesDifficulty =
      targetFilters.difficulty === '' ||
      item.recipe.difficulty === targetFilters.difficulty
    const matchesCategory =
      targetFilters.category === '' ||
      item.recipe.category === targetFilters.category
    const matchesListingType =
      targetFilters.listingType === '' ||
      item.listingType === targetFilters.listingType
    const matchesStatus =
      targetFilters.status === '' || item.listingStatus === targetFilters.status
    return (
      matchesKeyword &&
      matchesDifficulty &&
      matchesCategory &&
      matchesListingType &&
      matchesStatus
    )
  })
}

export default function MySalesPage() {
  const router = useRouter()
  const nickname = '유디'

  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP)
  const [listings] = useState(() => createMockListings(35))
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE_DESKTOP)
  const [prevFilterKey, setPrevFilterKey] = useState('')

  const sentinelRef = useRef(null)

  useEffect(() => {
    function applySize() {
      const isMobile = window.innerWidth <= DESKTOP_BREAKPOINT
      const nextSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP
      setPageSize(nextSize)
      setVisibleCount(nextSize)
    }

    applySize()
    window.addEventListener('resize', applySize)
    return () => window.removeEventListener('resize', applySize)
  }, [])

  const difficultyCounts = useMemo(() => {
    return DIFFICULTY_OPTIONS.map((option) => ({
      label: option.label,
      color: DIFFICULTY_TONE_VARS[option.tone],
      count: listings.filter((item) => item.recipe.difficulty === option.value)
        .length,
    }))
  }, [listings])

  const filteredListings = useMemo(
    () => getFilteredListings(listings, keyword, filters),
    [listings, keyword, filters],
  )

  const draftFilteredListings = useMemo(
    () => getFilteredListings(listings, keyword, draftFilters),
    [listings, keyword, draftFilters],
  )

  const visibleListings = filteredListings.slice(0, visibleCount)
  const hasNext = visibleCount < filteredListings.length

  const filterKey = `${keyword}|${filters.difficulty}|${filters.category}|${filters.listingType}|${filters.status}`
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setVisibleCount(pageSize)
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + pageSize)
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNext, pageSize])

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

  function handleBack() {
    router.back()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <Image src="/icons/left.svg" alt="" width={24} height={24} />
        </button>

        <h1 className={`${styles.pageTitle} font-baskin-robbins`}>
          나의 판매 레시피
        </h1>
      </div>

      <div className={styles.summarySection}>
        <p className={styles.summaryText}>
          {nickname}님의 판매 레시피{' '}
          <span className={styles.summaryCount}>({listings.length}장)</span>
        </p>

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
            filterGroups={MY_SALES_FILTER_GROUPS}
            filters={filters}
            draftFilters={draftFilters}
            isMobileOpen={isMobileOpen}
            resultCount={draftFilteredListings.length}
            onFilterChange={handleFilterChange}
            onDraftFilterChange={handleDraftFilterChange}
            onOpenMobile={handleOpenMobile}
            onCloseMobile={handleCloseMobile}
            onReset={handleReset}
            onApply={handleApply}
          />
        </div>
      </div>

      {visibleListings.length === 0 ? (
        <p className={styles.emptyText}>조건에 맞는 레시피가 없어요.</p>
      ) : (
        <div className={styles.grid}>
          {visibleListings.map((listing) => (
            <RecipeCard
              key={listing.id}
              thumbnailUrl={listing.recipe.imageUrl}
              title={listing.recipe.title}
              difficulty={listing.recipe.difficulty}
              category={listing.recipe.category}
              price={listing.recipe.minPrice}
              remainingQuantity={listing.remainingQuantity}
              badgeType={listing.badgeType}
              listingStatus={listing.listingStatus}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  )
}

'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  useMyMarketListingCount,
  useMyMarketListings,
  useMySentTradeOfferCount,
  useMySentTradeOffers,
} from '@/features/my-sales/hooks'
import useCurrentUser from '@/features/auth/useCurrentUser'
import {
  normalizeOwnListing,
  normalizeSentOffer,
} from '@/features/my-sales/normalize'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import LoadingIndicator from '@/components/common/LoadingIndicator/LoadingIndicator'
import ScrollToTopButton from '@/components/common/ScrollToTopButton/ScrollToTopButton'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import {
  DIFFICULTY_OPTIONS,
  DEFAULT_FILTERS,
  MY_SALES_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './page.module.css'

const DIFFICULTY_TONE_VARS = {
  easy: 'var(--color-main)',
  normal: 'var(--color-blue)',
  hard: 'var(--color-purple)',
  master: 'var(--color-pink)',
}

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
      (targetFilters.listingType === 'SALE' &&
        item.relationType === 'OWN_LISTING') ||
      (targetFilters.listingType === 'EXCHANGE' &&
        item.relationType === 'SENT_OFFER')
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
  const { user } = useCurrentUser()
  const nickname = user?.nickname ?? ''

  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const showOwnListings = filters.listingType !== 'EXCHANGE'
  const showSentOffers = filters.listingType !== 'SALE'

  // ---- 내가 등록한 판매글  ----
  const {
    data: listingsPages,
    fetchNextPage: fetchNextListings,
    hasNextPage: hasNextListings,
    isFetchingNextPage: isFetchingNextListings,
  } = useMyMarketListings(
    {
      keyword,
      difficulty: filters.difficulty,
      category: filters.category,
      status: filters.status,
    },
    {
      enabled: showOwnListings,
    },
  )

  // ---- 내가 보낸 교환 제안 ----
  const {
    data: offersPages,
    fetchNextPage: fetchNextOffers,
    hasNextPage: hasNextOffers,
    isFetchingNextPage: isFetchingNextOffers,
  } = useMySentTradeOffers(
    {
      status: 'PENDING',
      keyword,
      difficulty: filters.difficulty,
      category: filters.category,
      listingStatus: filters.status,
    },
    {
      enabled: showSentOffers,
    },
  )

  const previewOwnListings = draftFilters.listingType !== 'EXCHANGE'
  const previewSentOffers = draftFilters.listingType !== 'SALE'

  const ownCountQuery = useMyMarketListingCount(
    {
      keyword,
      difficulty: draftFilters.difficulty,
      category: draftFilters.category,
      status: draftFilters.status,
    },
    {
      enabled: isMobileOpen && previewOwnListings,
    },
  )

  const sentOfferCountQuery = useMySentTradeOfferCount(
    {
      status: 'PENDING',
      keyword,
      difficulty: draftFilters.difficulty,
      category: draftFilters.category,
      listingStatus: draftFilters.status,
    },
    {
      enabled: isMobileOpen && previewSentOffers,
    },
  )

  const draftResultCount =
    (previewOwnListings ? (ownCountQuery.data ?? 0) : 0) +
    (previewSentOffers ? (sentOfferCountQuery.data ?? 0) : 0)

  const myListings = useMemo(
    () => listingsPages?.pages.flatMap((page) => page.data) ?? [],
    [listingsPages],
  )

  const sentOffers = useMemo(
    () => offersPages?.pages.flatMap((page) => page.data) ?? [],
    [offersPages],
  )

  const displayableListings = useMemo(() => {
    const ownListings = myListings.map(normalizeOwnListing)
    const offerListings = sentOffers.map(normalizeSentOffer).filter(Boolean)

    return [...ownListings, ...offerListings]
  }, [myListings, sentOffers])

  const difficultyCounts = useMemo(() => {
    return DIFFICULTY_OPTIONS.map((option) => ({
      label: option.label,
      color: DIFFICULTY_TONE_VARS[option.tone],
      count: displayableListings.filter(
        (item) => item.recipe.difficulty === option.value,
      ).length,
    }))
  }, [displayableListings])

  const filteredListings = useMemo(
    () => getFilteredListings(displayableListings, keyword, filters),
    [displayableListings, keyword, filters],
  )

  const hasNext =
    (showOwnListings && hasNextListings) || (showSentOffers && hasNextOffers)
  const isFetchingNext =
    (showOwnListings && isFetchingNextListings) ||
    (showSentOffers && isFetchingNextOffers)

  const handleLoadMore = useCallback(() => {
    if (showOwnListings && hasNextListings) fetchNextListings()
    if (showSentOffers && hasNextOffers) fetchNextOffers()
  }, [
    showOwnListings,
    showSentOffers,
    hasNextListings,
    hasNextOffers,
    fetchNextListings,
    fetchNextOffers,
  ])

  const sentinelRef = useInfiniteScroll({
    hasMore: hasNext,
    isLoading: isFetchingNext,
    onLoadMore: handleLoadMore,
  })

  function handleKeywordChange(nextKeyword) {
    setKeyword(nextKeyword)
  }

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
        <h1 className={`${styles.pageTitle} font-baskin-robbins`}>
          나의 판매 레시피
        </h1>
      </div>

      <div className={styles.summarySection}>
        <p className={styles.summaryText}>
          {nickname}님의 판매 레시피{' '}
          <span className={styles.summaryCount}>
            ({displayableListings.length}장)
          </span>
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
            onChange={handleKeywordChange}
            onSearch={handleKeywordChange}
            placeholder="검색"
          />
        </div>

        <div className={styles.filterTrigger}>
          <RecipeFilter
            filterGroups={MY_SALES_FILTER_GROUPS}
            filters={filters}
            draftFilters={draftFilters}
            isMobileOpen={isMobileOpen}
            resultCount={draftResultCount}
            onFilterChange={handleFilterChange}
            onDraftFilterChange={handleDraftFilterChange}
            onOpenMobile={handleOpenMobile}
            onCloseMobile={handleCloseMobile}
            onReset={handleReset}
            onApply={handleApply}
          />
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <p className={styles.emptyText}>조건에 맞는 레시피가 없어요.</p>
      ) : (
        <div className={styles.grid}>
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.listingId}`}
              className={styles.cardLink}
            >
              <RecipeCard
                thumbnailUrl={listing.recipe.imageUrl}
                title={listing.recipe.title}
                difficulty={listing.recipe.difficulty}
                category={listing.recipe.category}
                sellerNickname={
                  listing.relationType === 'SENT_OFFER'
                    ? listing.sellerNickname
                    : undefined
                }
                price={listing.price}
                remainingQuantity={listing.remainingQuantity}
                badgeType={listing.badgeType}
                listingStatus={listing.listingStatus}
              />
            </Link>
          ))}
        </div>
      )}

      {isFetchingNext && <LoadingIndicator variant="list" />}

      <div ref={sentinelRef} className={styles.sentinel} />
      <ScrollToTopButton />
    </div>
  )
}

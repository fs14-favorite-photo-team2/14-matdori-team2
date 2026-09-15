'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useMyMarketListings,
  useMySentTradeOffers,
  usePendingOfferListingDetails,
} from '@/features/my-sales/hooks'
import {
  normalizeOwnListing,
  normalizeSentOffer,
} from '@/features/my-sales/normalize'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
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
  const router = useRouter()
  const nickname = '유디'

  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // ---- 1) 내가 등록한 판매글 (무한스크롤) ----
  const {
    data: listingsPages,
    fetchNextPage: fetchNextListings,
    hasNextPage: hasNextListings,
    isFetchingNextPage: isFetchingNextListings,
  } = useMyMarketListings({
    keyword,
    difficulty: filters.difficulty,
    category: filters.category,
  })

  // ---- 2) 내가 보낸 교환 제안 (무한스크롤) ----
  // 참고: trade-offers API는 keyword/difficulty/category 필터를 지원하지 않아
  // 항상 전체(PENDING)를 받아온 뒤 프론트에서 필터링합니다.
  const {
    data: offersPages,
    fetchNextPage: fetchNextOffers,
    hasNextPage: hasNextOffers,
    isFetchingNextPage: isFetchingNextOffers,
  } = useMySentTradeOffers({ status: 'PENDING' })

  const myListings = useMemo(
    () => listingsPages?.pages.flatMap((page) => page.data) ?? [],
    [listingsPages],
  )

  const sentOffers = useMemo(
    () => offersPages?.pages.flatMap((page) => page.data) ?? [],
    [offersPages],
  )

  // ---- 3) 보낸 제안들이 가리키는 판매글 상세조회 (N+1 우회) ----
  const pendingListingIds = useMemo(
    () => [...new Set(sentOffers.map((offer) => offer.listingId))],
    [sentOffers],
  )

  const listingDetailQueries = usePendingOfferListingDetails(pendingListingIds)

  const listingDetailMap = useMemo(() => {
    const map = new Map()
    listingDetailQueries.forEach((query, index) => {
      if (query.data) map.set(pendingListingIds[index], query.data)
    })
    return map
  }, [listingDetailQueries, pendingListingIds])

  // ---- 4) 두 목록을 합쳐서 화면용 데이터로 변환 ----
  const displayableListings = useMemo(() => {
    const ownListings = myListings.map(normalizeOwnListing)
    const offerListings = sentOffers
      .map((offer) => normalizeSentOffer(offer, listingDetailMap))
      .filter(Boolean)

    return [...ownListings, ...offerListings]
  }, [myListings, sentOffers, listingDetailMap])

  const difficultyCounts = useMemo(() => {
    return DIFFICULTY_OPTIONS.map((option) => ({
      label: option.label,
      color: DIFFICULTY_TONE_VARS[option.tone],
      count: displayableListings.filter(
        (item) => item.recipe.difficulty === option.value,
      ).length,
    }))
  }, [displayableListings])

  // keyword/category/listingType/status 필터는 로컬(클라이언트)에서 최종 적용
  // (trade-offers 쪽은 서버가 필터를 지원하지 않아 여기서 걸러야 함)
  const filteredListings = useMemo(
    () => getFilteredListings(displayableListings, keyword, filters),
    [displayableListings, keyword, filters],
  )

  const draftFilteredListings = useMemo(
    () => getFilteredListings(displayableListings, keyword, draftFilters),
    [displayableListings, keyword, draftFilters],
  )

  // 둘 중 하나라도 다음 페이지가 있으면 "더 불러올 수 있음" 처리
  const hasNext = hasNextListings || hasNextOffers
  const isFetchingNext = isFetchingNextListings || isFetchingNextOffers

  function handleLoadMore() {
    if (hasNextListings) fetchNextListings()
    if (hasNextOffers) fetchNextOffers()
  }

  // 스크롤이 바닥에 닿으면 다음 페이지 요청
  const [sentinelRef, setSentinelRef] = useState(null)

  useEffect(() => {
    if (!sentinelRef || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNext) {
          handleLoadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinelRef)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef, hasNext, isFetchingNext])

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

      {filteredListings.length === 0 ? (
        <p className={styles.emptyText}>조건에 맞는 레시피가 없어요.</p>
      ) : (
        <div className={styles.grid}>
          {filteredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
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

      <div ref={setSentinelRef} className={styles.sentinel} />
    </div>
  )
}

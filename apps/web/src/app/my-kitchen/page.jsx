'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button/Button'
import SearchBar from '@/components/common/SearchBar/SearchBar'
import RecipeFilter from '@/components/common/RecipeFilter/RecipeFilter'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import {
  DIFFICULTY_OPTIONS,
  DEFAULT_FILTERS,
  MY_KITCHEN_FILTER_GROUPS,
} from '@/constants/RecipeOptions'
import styles from './page.module.css'

const PAGE_SIZE = 9

const DIFFICULTY_TONE_VARS = {
  easy: 'var(--color-main)',
  normal: 'var(--color-blue)',
  hard: 'var(--color-purple)',
  master: 'var(--color-pink)',
}

const STATE_TO_BADGE = {
  LISTED: 'selling',
  OFFERED: 'exchangePending',
}

// ---- GET /api/users/me/recipe-copies 로 교체 ----
const RECIPE_NAMES_BY_CATEGORY = {
  KOREAN: ['김치찌개', '된장찌개', '제육볶음', '불고기', '비빔밥'],
  WESTERN: ['토마토 파스타', '크림 파스타', '스테이크', '리조또'],
  JAPANESE: ['가츠동', '오코노미야키', '카레라이스'],
  ASIAN: ['팟타이', '쌀국수', '분짜'],
  HOME_BAKING: ['휘낭시에', '스콘', '브라우니'],
}
const CATEGORY_KEYS = Object.keys(RECIPE_NAMES_BY_CATEGORY)
const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'MASTER']
const CREATOR_NICKNAMES = ['프로한식러', '미쓰손', '팝스타', '요리요정']

function createMockRecipeCopies(count) {
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORY_KEYS[i % CATEGORY_KEYS.length]
    const names = RECIPE_NAMES_BY_CATEGORY[category]
    const difficulty = DIFFICULTIES[i % DIFFICULTIES.length]
    const state = i % 5 === 0 ? 'LISTED' : i % 5 === 1 ? 'OFFERED' : 'OWNED'

    return {
      id: `recipe-copy-${i}`,
      state,
      recipe: {
        id: `recipe-${i}`,
        title: names[i % names.length],
        imageUrl: `https://picsum.photos/seed/recipe-${i}/800/600`,
        creatorNickname: CREATOR_NICKNAMES[i % CREATOR_NICKNAMES.length],
        difficulty,
        category,
        minPrice: 1000 + (i % 10) * 500,
      },
    }
  })
}
// ---------------------------------------------------------

export default function MyKitchenPage() {
  const nickname = '유디' // TODO: GET /api/users/me

  const [copies] = useState(() => createMockRecipeCopies(24))
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [prevFilterKey, setPrevFilterKey] = useState('')

  const sentinelRef = useRef(null)

  const difficultyCounts = useMemo(() => {
    return DIFFICULTY_OPTIONS.map((option) => ({
      label: option.label,
      color: DIFFICULTY_TONE_VARS[option.tone],
      count: copies.filter((c) => c.recipe.difficulty === option.value).length,
    }))
  }, [copies])

  const filteredCopies = useMemo(() => {
    return copies.filter((c) => {
      const matchesKeyword = c.recipe.title.includes(keyword.trim())
      const matchesDifficulty =
        filters.difficulty === '' || c.recipe.difficulty === filters.difficulty
      const matchesCategory =
        filters.category === '' || c.recipe.category === filters.category
      return matchesKeyword && matchesDifficulty && matchesCategory
    })
  }, [copies, keyword, filters])

  const visibleCopies = filteredCopies.slice(0, visibleCount)
  const hasNext = visibleCount < filteredCopies.length

  const filterKey = `${keyword}|${filters.difficulty}|${filters.category}`
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setVisibleCount(PAGE_SIZE)
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE)
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNext])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={`${styles.pageTitle} font-baskin-robbins`}>마이 키친</h1>
        <Link href="/my-kitchen/create">
          <Button variant="primary">레시피 생성하기</Button>
        </Link>
      </div>

      <div className={styles.summarySection}>
        <p className={styles.summaryText}>
          {nickname}님이 보유한 레시피{' '}
          <span className={styles.summaryCount}>({copies.length}장)</span>
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

        <RecipeFilter
          filterGroups={MY_KITCHEN_FILTER_GROUPS}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {visibleCopies.length === 0 ? (
        <p className={styles.emptyText}>조건에 맞는 레시피가 없어요.</p>
      ) : (
        <div className={styles.grid}>
          {visibleCopies.map((copy) => (
            <RecipeCard
              key={copy.id}
              imageUrl={copy.recipe.imageUrl}
              title={copy.recipe.title}
              difficulty={copy.recipe.difficulty}
              category={copy.recipe.category}
              sellerNickname={copy.recipe.creatorNickname}
              price={copy.recipe.minPrice}
              remainingQuantity={1}
              badgeType={STATE_TO_BADGE[copy.state]}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  )
}

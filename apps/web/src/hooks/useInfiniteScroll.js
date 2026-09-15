'use client'

import { useEffect, useRef } from 'react'

export default function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootRef,
  rootMargin = '0px 0px 200px 0px',
  enabled = true,
}) {
  const triggerRef = useRef(null)

  useEffect(() => {
    const trigger = triggerRef.current

    if (!enabled || !trigger || !hasMore || isLoading) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
      },
    )

    observer.observe(trigger)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, isLoading, onLoadMore, rootRef, rootMargin])

  return triggerRef
}

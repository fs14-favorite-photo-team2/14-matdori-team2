'use client'

import { useEffect, useState } from 'react'
import styles from './ScrollToTopButton.module.css'

const SHOW_THRESHOLD = 300

export default function ScrollToTopButton({ scrollTargetRef, className }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const target = scrollTargetRef?.current ?? window

    function getScrollTop() {
      return scrollTargetRef?.current
        ? scrollTargetRef.current.scrollTop
        : window.scrollY
    }

    function handleScroll() {
      setIsVisible(getScrollTop() > SHOW_THRESHOLD)
    }

    handleScroll()
    target.addEventListener('scroll', handleScroll)

    return () => {
      target.removeEventListener('scroll', handleScroll)
    }
  }, [scrollTargetRef])

  function handleClick() {
    if (scrollTargetRef?.current) {
      scrollTargetRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      className={`${styles.scrollTopButton} ${className ?? ''}`}
      onClick={handleClick}
      aria-label="맨 위로 이동"
    >
      ↑
    </button>
  )
}

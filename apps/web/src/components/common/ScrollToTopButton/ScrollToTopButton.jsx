'use client'

import { useEffect, useState } from 'react'
import styles from './ScrollToTopButton.module.css'

const SHOW_THRESHOLD = 300

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > SHOW_THRESHOLD)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      type="button"
      className={styles.scrollTopButton}
      onClick={handleClick}
      aria-label="맨 위로 이동"
    >
      ↑
    </button>
  )
}

'use client'

import Toast from '@/components/common/Toast/Toast'
import formatPoints from '@/utils/formatPoints'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import styles from './MobileMenu.module.css'

export default function MobileMenu({
  user,
  isAuthenticated,
  isOpen,
  isLoggingOut,
  onClose,
  onLogout,
}) {
  const pathname = usePathname()

  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const [showLoginToast, setShowLoginToast] = useState(false)
  const toastTimerRef = useRef(null)

  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartRef = useRef({
    x: 0,
    y: 0,
  })

  const handleProtectedMenuClick = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }

    setShowLoginToast(true)

    toastTimerRef.current = setTimeout(() => {
      setShowLoginToast(false)
      toastTimerRef.current = null
    }, 3000)
  }

  const handleDrawerPointerDown = (event) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    }

    setIsDragging(true)
  }

  const handleDrawerPointerMove = (event) => {
    if (!isDragging) return
    const deltaX = event.clientX - dragStartRef.current.x
    const deltaY = event.clientY - dragStartRef.current.y

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    setDragX(Math.min(0, deltaX))
  }

  const handleDrawerPointerEnd = (event) => {
    if (!isDragging) return

    const deltaX = event.clientX - dragStartRef.current.x
    const deltaY = event.clientY - dragStartRef.current.y
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)

    setIsDragging(false)
    setDragX(0)

    if (isHorizontalSwipe && deltaX <= -80) {
      onClose()
    }
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="메뉴 닫기"
      />

      {showLoginToast && (
        <div className={styles.toastWrapper}>
          <Toast message="로그인이 필요합니다." />
        </div>
      )}

      <div
        className={`${styles.content} ${isDragging ? styles.dragging : ''}`}
        style={{ '--drag-x': `${dragX}px` }}
        onPointerDown={handleDrawerPointerDown}
        onPointerMove={handleDrawerPointerMove}
        onPointerUp={handleDrawerPointerEnd}
        onPointerCancel={handleDrawerPointerEnd}
      >
        <div className={styles.userInfo}>
          {isAuthenticated ? (
            <>
              <p className={styles.greeting}>안녕하세요, {user?.nickname}님!</p>

              <div className={styles.pointsRow}>
                <span>보유 포인트</span>
                <span className={styles.pointsValue}>
                  {formatPoints(user?.points)}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className={styles.greeting}>로그인이 필요합니다.</p>
              <p className={styles.loginGuide}>
                내 정보를 확인하려면 로그인을 해주세요!
              </p>
            </>
          )}
        </div>

        <nav className={styles.navigation}>
          <Link
            href="/marketplace"
            onClick={onClose}
            className={`${styles.menuItem} ${
              isActive('/marketplace') ? styles.active : ''
            }`}
          >
            마켓플레이스
          </Link>

          {isAuthenticated ? (
            <Link
              href="/my-kitchen"
              onClick={onClose}
              className={`${styles.menuItem} ${
                isActive('/my-kitchen') ? styles.active : ''
              }`}
            >
              마이 키친
            </Link>
          ) : (
            <button
              type="button"
              className={styles.menuItem}
              onClick={handleProtectedMenuClick}
            >
              마이 키친
            </button>
          )}

          {isAuthenticated ? (
            <Link
              href="/my-sales"
              onClick={onClose}
              className={`${styles.menuItem} ${
                isActive('/my-sales') ? styles.active : ''
              }`}
            >
              판매 중인 레시피
            </Link>
          ) : (
            <button
              type="button"
              className={styles.menuItem}
              onClick={handleProtectedMenuClick}
            >
              판매 중인 레시피
            </button>
          )}
        </nav>

        {isAuthenticated && (
          <button
            type="button"
            className={styles.logoutButton}
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  )
}

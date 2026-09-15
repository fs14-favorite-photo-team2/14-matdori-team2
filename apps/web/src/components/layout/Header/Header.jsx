'use client'

import Toast from '@/components/common/Toast/Toast'
import { logout } from '@/features/auth/api'
import useCurrentUser, {
  CURRENT_USER_QUERY_KEY,
} from '@/features/auth/useCurrentUser'
import formatPoints from '@/utils/formatPoints'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MobileMenu from '../MobileMenu/MobileMenu'
import ProfileMenu from '../ProfileMenu/ProfileMenu'
import styles from './Header.module.css'

export default function Header() {
  const { user, isAuthenticated, isLoading, error } = useCurrentUser()

  const queryClient = useQueryClient()
  const router = useRouter()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileAreaRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [showLogoutToast, setShowLogoutToast] = useState(false)
  const logoutToastTimerRef = useRef(null)

  const logoutMutation = useMutation({
    mutationFn: logout,

    onMutate: () => {
      if (logoutToastTimerRef.current) {
        clearTimeout(logoutToastTimerRef.current)
        logoutToastTimerRef.current = null
      }

      setShowLogoutToast(false)
    },

    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null)

      setIsProfileOpen(false)
      setIsMobileMenuOpen(false)

      router.replace('/')
    },

    onError: () => {
      setShowLogoutToast(true)

      logoutToastTimerRef.current = setTimeout(() => {
        setShowLogoutToast(false)
        logoutToastTimerRef.current = null
      }, 3000)
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  useEffect(() => {
    if (!isProfileOpen) return

    const handlePointerDown = (event) => {
      if (!profileAreaRef.current?.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileOpen])

  useEffect(() => {
    return () => {
      if (logoutToastTimerRef.current) {
        clearTimeout(logoutToastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const tabletMediaQuery = window.matchMedia('(min-width: 744px)')

    const handleBreakpointChange = (event) => {
      if (event.matches) {
        setIsMobileMenuOpen(false)
      }
    }

    tabletMediaQuery.addEventListener('change', handleBreakpointChange)

    return () => {
      tabletMediaQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  return (
    <header className={styles.header}>
      {showLogoutToast && (
        <div className={styles.toastWrapper}>
          <Toast message="로그아웃에 실패했습니다." />
        </div>
      )}

      <div className={styles.inner}>
        <Link
          href={isAuthenticated ? '/marketplace' : '/'}
          className={styles.logoLink}
        >
          <Image
            src="/logos/matdori-logo.svg"
            alt="맛도리 마켓"
            width={140}
            height={30}
          />
        </Link>

        <div className={styles.actions}>
          {!isLoading && !error && !isAuthenticated && (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}

          {!isLoading && !error && isAuthenticated && (
            <>
              <span className={styles.points}>
                {formatPoints(user?.points)}
              </span>

              <button
                type="button"
                className={styles.iconButton}
                aria-label="알림 열기"
              >
                <Image
                  src="/icons/alarm-default.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              <div className={styles.profileArea} ref={profileAreaRef}>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-expanded={isProfileOpen}
                >
                  {user?.nickname}
                </button>

                {isProfileOpen && (
                  <div className={styles.profileMenuWrapper}>
                    <ProfileMenu
                      nickname={user?.nickname}
                      points={user?.points}
                      onClose={() => setIsProfileOpen(false)}
                    />
                  </div>
                )}
              </div>

              <span className={styles.divider} aria-hidden="true" />

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.mobileInner}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="메뉴 열기"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Image src="/icons/menu.svg" alt="" width={24} height={24} />
        </button>

        <Link
          href={isAuthenticated ? '/marketplace' : '/'}
          className={styles.mobileLogoLink}
        >
          <Image
            src="/logos/matdori-logo.svg"
            alt="맛도리 마켓"
            width={100}
            height={22}
          />
        </Link>

        <div className={styles.mobileRight}>
          {!isLoading && !error && !isAuthenticated && (
            <Link href="/login" className={styles.mobileLogin}>
              로그인
            </Link>
          )}

          {!isLoading && !error && isAuthenticated && (
            <button
              type="button"
              className={styles.iconButton}
              aria-label="알림 열기"
            >
              <Image
                src="/icons/alarm-default.svg"
                alt=""
                width={24}
                height={24}
              />
            </button>
          )}
        </div>
      </div>

      <MobileMenu
        user={user}
        isAuthenticated={isAuthenticated}
        isOpen={isMobileMenuOpen}
        isLoggingOut={logoutMutation.isPending}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  )
}

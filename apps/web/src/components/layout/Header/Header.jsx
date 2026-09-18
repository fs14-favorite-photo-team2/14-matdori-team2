'use client'

import Toast from '@/components/common/Toast/Toast'
import serviceIcon from '@/app/icon.png'
import { logout } from '@/features/auth/api'
import useCurrentUser, {
  CURRENT_USER_QUERY_KEY,
} from '@/features/auth/useCurrentUser'
import useUnreadNotificationCount from '@/features/notifications/useUnreadNotificationCount'
import RandomPointModal from '@/features/random-point/RandomPointModal'
import useTimedToast from '@/hooks/useTimedToast'
import { queryKeys } from '@/lib/queryKeys'
import formatPoints from '@/utils/formatPoints'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import MobileMenu from '../MobileMenu/MobileMenu'
import NotificationModal from '../NotificationModal/NotificationModal'
import ProfileMenu from '../ProfileMenu/ProfileMenu'
import styles from './Header.module.css'

const MOBILE_MEDIA_QUERY = '(max-width: 743px)'

function subscribeToMobileViewport(callback) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)

  mediaQuery.addEventListener('change', callback)

  return () => {
    mediaQuery.removeEventListener('change', callback)
  }
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerMobileViewportSnapshot() {
  return false
}

export default function Header() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    refetch: refetchCurrentUser,
  } = useCurrentUser()
  const { data: unreadCount = 0 } = useUnreadNotificationCount({
    enabled: !isLoading && !error && isAuthenticated,
  })

  const hasUnreadNotifications = unreadCount > 0

  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    toastMessage: notificationToastMessage,
    showToast: showNotificationToast,
  } = useTimedToast()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileAreaRef = useRef(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationAreaRef = useRef(null)

  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot,
  )

  const [showLogoutToast, setShowLogoutToast] = useState(false)
  const logoutToastTimerRef = useRef(null)

  const [isRandomPointOpen, setIsRandomPointOpen] = useState(false)

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

      queryClient.removeQueries({
        queryKey: queryKeys.notifications.all,
      })

      setIsProfileOpen(false)
      setIsNotificationOpen(false)
      setIsMobileMenuOpen(false)
      setIsRandomPointOpen(false)

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
    if (!isProfileOpen && !isNotificationOpen) return

    const handlePointerDown = (event) => {
      if (isProfileOpen && !profileAreaRef.current?.contains(event.target)) {
        setIsProfileOpen(false)
      }

      if (
        isNotificationOpen &&
        !isMobileViewport &&
        !notificationAreaRef.current?.contains(event.target)
      ) {
        setIsNotificationOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileOpen, isNotificationOpen, isMobileViewport])

  useEffect(() => {
    return () => {
      if (logoutToastTimerRef.current) {
        clearTimeout(logoutToastTimerRef.current)
      }
    }
  }, [])

  const handleNotificationToggle = () => {
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
    setIsNotificationOpen((prev) => !prev)
  }

  const handleProfileToggle = () => {
    setIsNotificationOpen(false)
    setIsProfileOpen((prev) => !prev)
  }

  const handleMobileMenuOpen = () => {
    setIsNotificationOpen(false)
    setIsMobileMenuOpen(true)
  }

  const handleRandomPointOpen = () => {
    setIsProfileOpen(false)
    setIsNotificationOpen(false)
    setIsMobileMenuOpen(false)
    setIsRandomPointOpen(true)
  }

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)

    const handleBreakpointChange = (event) => {
      if (!event.matches) {
        setIsMobileMenuOpen(false)
      }
    }

    mobileMediaQuery.addEventListener('change', handleBreakpointChange)

    return () => {
      mobileMediaQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  return (
    <header className={styles.header}>
      {(showLogoutToast || notificationToastMessage) && (
        <div className={styles.toastWrapper}>
          <Toast
            message={
              showLogoutToast
                ? '로그아웃에 실패했습니다.'
                : notificationToastMessage
            }
          />
        </div>
      )}

      <div className={styles.inner}>
        <div className={styles.brandArea}>
          <Image src={serviceIcon} alt="" className={styles.serviceIcon} />

          <Link
            href={isAuthenticated ? '/marketplace' : '/'}
            className={styles.logoLink}
          >
            <Image
              src="/logos/matdori-logo.svg"
              alt="맛도리 마켓"
              width={140}
              height={30}
              className={styles.wordmark}
            />
          </Link>
        </div>

        <div className={styles.actions}>
          {!isLoading && !error && !isAuthenticated && (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}

          {!isLoading && !error && isAuthenticated && (
            <>
              <button
                type="button"
                className={styles.points}
                onClick={handleRandomPointOpen}
                aria-haspopup="dialog"
                aria-expanded={isRandomPointOpen}
              >
                {formatPoints(user?.points)}
              </button>

              <div
                className={styles.notificationArea}
                ref={notificationAreaRef}
              >
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="알림 열기"
                  aria-expanded={isNotificationOpen}
                  onClick={handleNotificationToggle}
                >
                  <Image
                    src={
                      hasUnreadNotifications
                        ? '/icons/alarm-active.svg'
                        : '/icons/alarm-default.svg'
                    }
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>

                {!isMobileViewport && (
                  <NotificationModal
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    onReadError={showNotificationToast}
                    unreadCount={unreadCount}
                  />
                )}
              </div>

              <div className={styles.profileArea} ref={profileAreaRef}>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={handleProfileToggle}
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
          onClick={handleMobileMenuOpen}
        >
          <Image src="/icons/menu.svg" alt="" width={24} height={24} />
        </button>

        <div className={styles.mobileBrand}>
          <Image
            src={serviceIcon}
            alt=""
            width={29}
            height={29}
            className={styles.mobileServiceIcon}
          />

          <Link
            href={isAuthenticated ? '/marketplace' : '/'}
            className={styles.mobileLogoLink}
          >
            <Image
              src="/logos/matdori-logo.svg"
              alt="맛도리 마켓"
              width={100}
              height={22}
              className={styles.mobileWordmark}
            />
          </Link>
        </div>

        <div className={styles.mobileRight}>
          {!isLoading && !error && !isAuthenticated && (
            <Link href="/login" className={styles.mobileLogin}>
              로그인
            </Link>
          )}

          {!isLoading && !error && isAuthenticated && (
            <>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="알림 열기"
                aria-expanded={isNotificationOpen}
                onClick={handleNotificationToggle}
              >
                <Image
                  src={
                    hasUnreadNotifications
                      ? '/icons/alarm-active.svg'
                      : '/icons/alarm-default.svg'
                  }
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              {isMobileViewport && (
                <NotificationModal
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onReadError={showNotificationToast}
                  unreadCount={unreadCount}
                  isMobile
                />
              )}
            </>
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
        onOpenRandomPoint={handleRandomPointOpen}
      />
      {isAuthenticated && (
        <RandomPointModal
          isOpen={isRandomPointOpen}
          onClose={() => setIsRandomPointOpen(false)}
          onClaimed={() => refetchCurrentUser()}
        />
      )}
    </header>
  )
}

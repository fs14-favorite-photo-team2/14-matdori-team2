'use client'

import useNotifications from '@/features/notifications/useNotifications'
import useReadAllNotifications from '@/features/notifications/useReadAllNotifications'
import useReadNotification from '@/features/notifications/useReadNotification'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import formatRelativeTime from '@/utils/formatRelativeTime'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import styles from './NotificationModal.module.css'

export default function NotificationModal({
  isOpen,
  onClose,
  onReadError,
  unreadCount = 0,
  isMobile = false,
}) {
  const router = useRouter()

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useNotifications({
    enabled: isOpen,
  })

  const notifications = data?.pages.flatMap((page) => page.data) ?? []

  const readNotificationMutation = useReadNotification()
  const readAllNotificationsMutation = useReadAllNotifications()

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      readNotificationMutation.mutate(notification.id, {
        onError: (error) => {
          onReadError?.(
            getApiErrorMessage(error, '알림 읽음 처리에 실패했습니다.'),
          )
        },
      })
    }

    if (!notification.listingId) return

    onClose()
    router.push(`/marketplace/${notification.listingId}`)
  }

  const handleReadAll = () => {
    if (unreadCount === 0 || readAllNotificationsMutation.isPending) return

    readAllNotificationsMutation.mutate(undefined, {
      onError: (error) => {
        onReadError?.(
          getApiErrorMessage(error, '알림 모두 읽음 처리에 실패했습니다.'),
        )
      },
    })
  }

  const listRef = useRef(null)

  const triggerRef = useInfiniteScroll({
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: fetchNextPage,
    rootRef: listRef,
    enabled: isOpen && !isFetchNextPageError,
  })

  useEffect(() => {
    if (!isOpen || !isMobile) return

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isMobile])

  return (
    <section
      className={`${styles.notificationModal} ${isOpen ? styles.open : ''}`}
      aria-label="알림"
      aria-hidden={!isOpen}
    >
      <div className={styles.desktopHeader}>
        <button
          type="button"
          className={styles.readAllButton}
          onClick={handleReadAll}
          disabled={unreadCount === 0 || readAllNotificationsMutation.isPending}
        >
          모두 읽음
        </button>
      </div>

      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onClose}
          aria-label="알림 닫기"
        >
          <Image src="/icons/left.svg" alt="" width={22} height={22} />
        </button>

        <h2 className={styles.mobileTitle}>알림</h2>

        <button
          type="button"
          className={styles.readAllButton}
          onClick={handleReadAll}
          disabled={unreadCount === 0 || readAllNotificationsMutation.isPending}
        >
          모두 읽음
        </button>
      </div>

      <div ref={listRef} className={styles.notificationList}>
        {isPending ? (
          <p className={styles.stateMessage}>알림을 불러오는 중...</p>
        ) : isError && notifications.length === 0 ? (
          <div className={styles.state}>
            <p className={styles.stateMessage}>
              {getApiErrorMessage(error, '알림을 불러오지 못했습니다.')}
            </p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? '불러오는 중...' : '다시 시도'}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <p className={styles.stateMessage}>새로운 알림이 없습니다.</p>
        ) : (
          <>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`${styles.notificationItem} ${
                  notification.isRead ? styles.read : styles.unread
                }`}
                onClick={() => handleNotificationClick(notification)}
                disabled={readNotificationMutation.isPending}
              >
                <span className={styles.message}>{notification.message}</span>

                <span className={styles.time}>
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </button>
            ))}

            {isFetchingNextPage && (
              <p className={styles.nextPageMessage}>알림을 더 불러오는 중...</p>
            )}

            {isFetchNextPageError && (
              <div className={styles.nextPageState}>
                <p className={styles.nextPageMessage}>
                  {getApiErrorMessage(
                    error,
                    '다음 알림을 불러오지 못했습니다.',
                  )}
                </p>

                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? '불러오는 중...' : '다시 시도'}
                </button>
              </div>
            )}

            {hasNextPage && !isFetchNextPageError && (
              <div
                ref={triggerRef}
                className={styles.scrollTrigger}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}

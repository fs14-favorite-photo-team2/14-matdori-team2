'use client'

import formatRelativeTime from '@/utils/formatRelativeTime'
import Image from 'next/image'
import { useEffect } from 'react'
import styles from './NotificationModal.module.css'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "'떡볶이 황금레시피' 레시피에 교환 제안이 도착했습니다.",
    createdAt: new Date(Date.now() - 30 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 2,
    message: "'김치찌개' 레시피가 모두 판매되었습니다.",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 3,
    message: "'제육볶음' 레시피 교환 제안이 수락되었습니다.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 4,
    message: "'된장찌개' 레시피가 구매되었습니다.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 5,
    message: "'순두부찌개' 레시피 교환 제안이 거절되었습니다.",
    createdAt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 6,
    message: "'똥맛카레' 레시피가 구매되었습니다.",
    createdAt: new Date(
      Date.now() - 2 * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: true,
  },
  {
    id: 7,
    message: "'된장찌개' 레시피 교환 제안이 거절되었습니다.",
    createdAt: new Date(
      Date.now() - 13 * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: true,
  },
]

export default function NotificationModal({
  isOpen,
  onClose,
  isMobile = false,
}) {
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
        <button type="button" className={styles.readAllButton}>
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

        <button type="button" className={styles.readAllButton}>
          모두 읽음
        </button>
      </div>

      <div className={styles.notificationList}>
        {MOCK_NOTIFICATIONS.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className={`${styles.notificationItem} ${
              notification.isRead ? styles.read : styles.unread
            }`}
          >
            <span className={styles.message}>{notification.message}</span>
            <span className={styles.time}>
              {formatRelativeTime(notification.createdAt)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

'use client'

import formatPoints from '@/utils/formatPoints'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './ProfileMenu.module.css'

export default function ProfileMenu({ nickname, points, onClose }) {
  const pathname = usePathname()

  const isActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className={styles.profileMenu}>
      <p className={styles.greeting}>안녕하세요, {nickname}님!</p>

      <div className={styles.pointsRow}>
        <span>보유 포인트</span>

        <span className={styles.pointsValue}>{formatPoints(points)}</span>
      </div>

      <hr className={styles.divider} />

      <nav className={styles.navigation}>
        <Link
          href="/marketplace"
          onClick={onClose}
          className={isActive('/marketplace') ? styles.active : ''}
        >
          마켓플레이스
        </Link>

        <Link
          href="/my-kitchen"
          onClick={onClose}
          className={isActive('/my-kitchen') ? styles.active : ''}
        >
          마이 키친
        </Link>

        <Link
          href="/my-sales"
          onClick={onClose}
          className={isActive('/my-sales') ? styles.active : ''}
        >
          판매 중인 레시피
        </Link>
      </nav>
    </div>
  )
}

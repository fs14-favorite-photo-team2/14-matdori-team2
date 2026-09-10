'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from './MobileHeader.module.css'

export default function MobileHeader({ title, backHref, onBack }) {
  const backIcon = <Image src="/icons/left.svg" alt="" width={32} height={32} />

  return (
    <header className={styles.mobileHeader}>
      {backHref ? (
        <Link
          href={backHref}
          className={styles.backButton}
          aria-label="이전 페이지로 돌아가기"
        >
          {backIcon}
        </Link>
      ) : (
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="이전 화면으로 돌아가기"
        >
          {backIcon}
        </button>
      )}

      <h1 className={styles.title}>{title}</h1>
    </header>
  )
}

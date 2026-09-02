'use client'

import Image from 'next/image'
import styles from './Pagination.module.css'
import leftIcon from './icons/type_left.svg'
import rightIcon from './icons/type_right.svg'

const BOUNDARY_COUNT = 3

function range(start, end) {
  const length = end - start + 1
  return Array.from({ length }, (_, i) => start + i)
}

function getPageItems(currentPage, totalPages) {
  if (totalPages <= BOUNDARY_COUNT * 2 + 1) {
    return range(1, totalPages)
  }

  const firstPages = range(1, BOUNDARY_COUNT)
  const lastPages = range(totalPages - BOUNDARY_COUNT + 1, totalPages)

  if (
    currentPage <= BOUNDARY_COUNT ||
    currentPage > totalPages - BOUNDARY_COUNT
  ) {
    return [...firstPages, 'ellipsis', ...lastPages]
  }

  return [...firstPages, 'ellipsis', currentPage, 'ellipsis', ...lastPages]
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pageItems = getPageItems(currentPage, totalPages)

  return (
    <nav className={styles.wrapper} aria-label="페이지네이션">
      <button
        type="button"
        className={styles.arrowButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <Image src={leftIcon} alt="" width={24} height={24} />
      </button>

      {pageItems.map((item, index) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            className={`${styles.pageButton} ${item === currentPage ? styles.active : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            ...
          </span>
        ),
      )}

      <button
        type="button"
        className={styles.arrowButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <Image src={rightIcon} alt="" width={24} height={24} />
      </button>
    </nav>
  )
}

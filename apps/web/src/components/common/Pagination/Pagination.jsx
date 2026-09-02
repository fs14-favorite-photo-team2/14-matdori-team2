'use client'

import styles from './Pagination.module.css'

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M10.1008 12.1004L14.3008 7.90039L14.3008 16.3004L10.1008 12.1004Z"
            fill="#5A5A5A"
          />
        </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M14.2996 12.0998L10.0996 16.2998L10.0996 7.89981L14.2996 12.0998Z"
            fill="white"
          />
        </svg>
      </button>
    </nav>
  )
}

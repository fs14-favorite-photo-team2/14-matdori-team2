'use client'

import Button from '../Button/Button'
import styles from './ErrorState.module.css'

export default function ErrorState({ title, message, onRetry }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={`${styles.title} font-baskin-robbins`}>{title}</h1>
        <p className={styles.message}>{message}</p>

        <Button
          type="button"
          variant="secondary"
          className={styles.retryButton}
          onClick={() => onRetry()}
        >
          다시 시도
        </Button>
      </div>
    </div>
  )
}

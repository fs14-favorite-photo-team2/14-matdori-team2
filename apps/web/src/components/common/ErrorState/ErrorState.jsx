'use client'

import Button from '../Button/Button'
import styles from './ErrorState.module.css'

export default function ErrorState({
  title,
  titleMuted,
  message,
  actionLabel,
  onAction,
  isActionLoading = false,
  actionLoadingLabel = '처리 중...',
}) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={`${styles.title} font-baskin-robbins`}>
          {title}
          {titleMuted && (
            <span className={styles.titleMuted}> {titleMuted}</span>
          )}
        </h1>

        <p className={styles.message}>{message}</p>

        {onAction && (
          <Button
            type="button"
            variant="secondary"
            className={styles.actionButton}
            onClick={() => onAction()}
            disabled={isActionLoading}
          >
            {isActionLoading ? actionLoadingLabel : actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

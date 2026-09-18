'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'
import styles from './ActionResult.module.css'

const REDIRECT_DELAY_SECONDS = 5
const FAILURE_MESSAGE =
  '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

export default function ActionResult({
  status = 'success',
  actionName,
  descriptionInfo,
  descriptionMessage,
  buttonLabel,
  redirectTo,
  redirectPageName,
  onAction,
}) {
  const router = useRouter()
  const [remainingSeconds, setRemainingSeconds] = useState(
    REDIRECT_DELAY_SECONDS,
  )
  const isSuccess = status === 'success'

  const resultText = isSuccess ? '성공' : '실패'

  const resultMessage = isSuccess ? descriptionMessage : FAILURE_MESSAGE

  useEffect(() => {
    if (!isSuccess) return

    // 타이머 표시
    const countdownTimer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 1 ? prev - 1 : prev))
    }, 1000)

    const redirectTimer = setTimeout(() => {
      router.replace(redirectTo)
    }, REDIRECT_DELAY_SECONDS * 1000)

    return () => {
      clearInterval(countdownTimer)
      clearTimeout(redirectTimer)
    }
  }, [isSuccess, redirectTo, router])

  function handleAction() {
    if (onAction) {
      onAction()
      return
    }

    router.replace(redirectTo)
  }

  return (
    <section className={styles.container}>
      {isSuccess && (
        <div className={styles.toastWrapper}>
          <Toast
            message={`${remainingSeconds}초 후 ${redirectPageName} 페이지로 이동합니다.`}
          />
        </div>
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>
          {actionName}{' '}
          <span className={isSuccess ? styles.success : styles.failure}>
            {resultText}
          </span>
        </h1>

        <p className={styles.description}>
          {isSuccess && descriptionInfo && <span>{descriptionInfo}</span>}
          <span>{resultMessage}</span>
        </p>

        <Button
          variant="secondary"
          className={styles.redirectButton}
          onClick={handleAction}
        >
          {buttonLabel}
        </Button>
      </div>
    </section>
  )
}

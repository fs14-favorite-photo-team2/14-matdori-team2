'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/common/Button/Button'
import { claimRandomBox, fetchRandomPointStatus } from './api'
import styles from './RandomPointModal.module.css'

const BOXES = [
  { id: 'blue', iconSrc: '/images/randompoint/random-box-blue.png' },
  { id: 'purple', iconSrc: '/images/randompoint/random-box-purple.png' },
  { id: 'pink', iconSrc: '/images/randompoint/random-box-pink.png' },
]

function formatRemaining(nextClaimableAt) {
  const diffMs = new Date(nextClaimableAt) - new Date()
  if (diffMs <= 0) return '0시간 0분'

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}시간 ${minutes}분`
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

function getNextKstMidnight(now) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS)
  const kstDayStart = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate() + 1,
  )
  return new Date(kstDayStart - KST_OFFSET_MS)
}

export default function RandomPointModal({ isOpen, onClose, onClaimed }) {
  const [phase, setPhase] = useState('loading')
  const [selectedBoxId, setSelectedBoxId] = useState(null)
  const [earnedPoints, setEarnedPoints] = useState(null)
  const [nextClaimableAt, setNextClaimableAt] = useState(null)
  const [remainingText, setRemainingText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false

    fetchRandomPointStatus()
      .then(({ canClaim, nextClaimableAt: nextAt }) => {
        if (isCancelled) return

        if (canClaim) {
          setPhase('picking')
        } else {
          setNextClaimableAt(nextAt)
          setPhase('unavailable')
        }
      })
      .catch((err) => {
        if (isCancelled) return
        console.error('랜덤포인트 상태 조회 실패', err)
        setPhase('picking')
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (phase !== 'picking' && phase !== 'result' && phase !== 'unavailable') {
      return undefined
    }

    if (phase !== 'picking' && !nextClaimableAt) {
      return undefined
    }

    function updateRemaining() {
      const target =
        phase === 'picking' ? getNextKstMidnight(new Date()) : nextClaimableAt
      setRemainingText(formatRemaining(target))
    }

    updateRemaining()
    const timer = setInterval(updateRemaining, 1000 * 30)

    return () => clearInterval(timer)
  }, [phase, nextClaimableAt])

  if (!isOpen) return null

  function handleSelectBox(boxId) {
    setSelectedBoxId(boxId)
  }

  async function handleConfirm() {
    if (!selectedBoxId || isSubmitting) return
    setIsSubmitting(true)
    setError('')

    try {
      const {
        rewardPoints,
        currentPoints,
        nextClaimableAt: nextAt,
      } = await claimRandomBox()
      setEarnedPoints(rewardPoints)
      setNextClaimableAt(nextAt)
      setPhase('result')
      onClaimed?.(currentPoints)
    } catch (err) {
      console.error('랜덤포인트 수령 실패', err)
      if (err?.response?.data?.code === 'RANDOM_BOX_NOT_READY') {
        setError('오늘은 이미 받으셨어요. 내일 다시 도전해 주세요!')
      } else {
        setError('포인트 획득에 실패했어요. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setPhase('loading')
    setSelectedBoxId(null)
    setEarnedPoints(null)
    setNextClaimableAt(null)
    setError('')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.modal} ${
          phase === 'loading' || phase === 'unavailable'
            ? styles.modalCompact
            : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="닫기"
        >
          ×
        </button>

        {phase === 'loading' && (
          <>
            <h2 className={styles.title}>
              랜덤<span className={styles.highlight}>포인트</span>
            </h2>
            <p className={styles.description}>확인 중...</p>
          </>
        )}

        {phase === 'picking' && (
          <>
            <h2 className={styles.title}>
              랜덤<span className={styles.highlight}>포인트</span>
            </h2>
            <p className={styles.description}>
              하루에 한 번 돌아오는 기회!
              <br />
              랜덤 상자 뽑기를 통해 포인트를 획득하세요!
            </p>

            <p className={styles.countdownText}>
              다음 기회까지 남은 시간{' '}
              <span className={styles.countdownValue}>{remainingText}</span>
            </p>

            <div className={styles.boxRow}>
              {BOXES.map((box) => (
                <button
                  key={box.id}
                  type="button"
                  className={`${styles.boxButton} ${
                    selectedBoxId === box.id ? styles.boxSelected : ''
                  }`}
                  onClick={() => handleSelectBox(box.id)}
                >
                  <Image
                    src={box.iconSrc}
                    alt={`${box.id} 랜덤 박스`}
                    fill
                    sizes="144px"
                    className={styles.boxImage}
                  />
                </button>
              ))}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {selectedBoxId && (
              <Button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? '확인 중...' : '선택완료'}
              </Button>
            )}
          </>
        )}

        {phase === 'result' && (
          <>
            <h2 className={styles.title}>
              랜덤<span className={styles.highlight}>포인트</span>
            </h2>

            <div className={styles.contentGroup}>
              <div className={styles.resultImageWrap}>
                <Image
                  src="/images/randompoint/point.png"
                  alt="포인트 획득"
                  width={340}
                  height={324}
                  className={styles.resultImage}
                />
              </div>

              <div className={styles.resultPoint}>{earnedPoints}P 획득!</div>
              <p className={styles.countdownText}>
                다음 기회까지 남은 시간{' '}
                <span className={styles.countdownValue}>{remainingText}</span>
              </p>
            </div>
          </>
        )}

        {phase === 'unavailable' && (
          <>
            <h2 className={styles.title}>
              랜덤<span className={styles.highlight}>포인트</span>
            </h2>

            <div className={styles.contentGroup}>
              <p className={styles.description}>
                오늘은 이미 뽑기를 완료했어요!
                <br />
                내일 다시 도전해 주세요.
              </p>
              <p className={styles.countdownText}>
                다음 기회까지 남은 시간{' '}
                <span className={styles.countdownValue}>{remainingText}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

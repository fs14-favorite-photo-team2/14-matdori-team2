'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION = 3000

export default function useTimedToast(duration = DEFAULT_DURATION) {
  const [toastMessage, setToastMessage] = useState('')
  const timerRef = useRef(null)

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setToastMessage('')
  }, [])

  const showToast = useCallback(
    (message) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setToastMessage(message)

      timerRef.current = setTimeout(() => {
        setToastMessage('')
        timerRef.current = null
      }, duration)
    },
    [duration],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    toastMessage,
    showToast,
    hideToast,
  }
}

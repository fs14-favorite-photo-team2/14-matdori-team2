'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import styles from './Modal.module.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
  ariaLabel,
  dialogRef,
}) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isLarge = variant === 'large'

  return createPortal(
    <div
      className={`${styles.backdrop} ${isLarge ? styles.largeBackdrop : ''}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${isLarge ? styles.largeDialog : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          <Image src="/icons/type_close.svg" alt="" width={24} height={24} />
        </button>
        {title && <h2 className={styles.title}>{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  )
}

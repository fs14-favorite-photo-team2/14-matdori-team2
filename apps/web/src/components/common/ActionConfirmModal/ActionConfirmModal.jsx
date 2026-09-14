'use client'

import Button from '../Button/Button'
import Modal from '../Modal/Modal'
import styles from './ActionConfirmModal.module.css'

export default function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isPending = false,
}) {
  function handleConfirm() {
    if (isPending) return
    onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} ariaLabel={title}>
      <div className={styles.content}>
        <p className={styles.description}>{description}</p>

        <Button
          type="button"
          className={styles.confirmButton}
          onClick={handleConfirm}
          disabled={isPending}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

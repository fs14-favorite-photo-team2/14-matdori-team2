'use client'

import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import Modal from '@/components/common/Modal/Modal'
import styles from './LoginRequiredModal.module.css'

export default function LoginRequiredModal({ isOpen, onClose }) {
  const router = useRouter()

  function handleConfirm() {
    onClose()
    router.push('/login')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="로그인이 필요합니다.">
      <div className={styles.content}>
        <p className={styles.description}>
          로그인 하시겠습니까?
          <br />
          다양한 서비스를 편리하게 이용하실 수 있습니다.
        </p>

        <Button
          type="button"
          className={styles.confirmButton}
          onClick={handleConfirm}
        >
          확인
        </Button>
      </div>
    </Modal>
  )
}

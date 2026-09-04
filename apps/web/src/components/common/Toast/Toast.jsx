import Image from 'next/image'
import styles from './Toast.module.css'

export default function Toast({ message }) {
  return (
    <div className={styles.toast}>
      <Image
        className={styles.icon}
        src="/icons/toast-info.svg"
        alt=""
        width={20}
        height={20}
      />
      <span className={styles.message}>{message}</span>
    </div>
  )
}

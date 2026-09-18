import styles from './LoadingIndicator.module.css'

const DEFAULT_MESSAGES = {
  page: '로딩중입니다',
  list: '리스트를 더 불러오는 중입니다',
}

export default function LoadingIndicator({
  variant = 'page',
  message,
  className = '',
}) {
  return (
    <p className={`${styles.loadingText} ${styles[variant]} ${className}`}>
      {message ?? DEFAULT_MESSAGES[variant]}
    </p>
  )
}

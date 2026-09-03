import styles from './Button.module.css'

const VARIANT_STYLES = {
  primary: styles.primary,
  secondary: styles.secondary,
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const buttonClassName = [styles.button, VARIANT_STYLES[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  )
}

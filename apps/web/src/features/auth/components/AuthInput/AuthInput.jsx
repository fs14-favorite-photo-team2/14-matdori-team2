'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './AuthInput.module.css'

export default function AuthInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  disabled = false,
  ref,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && isPasswordVisible ? 'text' : type

  const passwordIconSrc = disabled
    ? isPasswordVisible
      ? '/icons/visible-disabled.svg'
      : '/icons/invisible-disabled.svg'
    : isPasswordVisible
      ? '/icons/visible.svg'
      : '/icons/invisible.svg'

  return (
    <div className={`${styles.field} ${disabled ? styles.fieldDisabled : ''}`}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>

      <div
        className={`${styles.inputWrapper} ${
          error ? styles.inputWrapperError : ''
        }`}
      >
        <input
          ref={ref}
          id={name}
          name={name}
          className={styles.input}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.visibilityButton}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            disabled={disabled}
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            aria-pressed={isPasswordVisible}
          >
            <Image src={passwordIconSrc} alt="" width={24} height={24} />
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  )
}

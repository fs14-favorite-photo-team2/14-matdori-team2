'use client'

import { useRef, useState } from 'react'
import styles from './ImageUploader.module.css'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 5

export default function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState(value?.name ?? '')
  const [error, setError] = useState('')

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'jpg, png 형식만 업로드 할 수 있어요'
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${MAX_SIZE_MB}MB 이하 파일만 업로드 할 수 있어요.`
    }
    return ''
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setFileName(file.name)
    onChange?.(file)
  }

  function handleRemove() {
    setFileName('')
    setError('')
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleSelectClick() {
    inputRef.current?.click()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.fileField}>
          <span className={fileName ? styles.fileName : styles.placeholder}>
            {fileName || '이미지를 첨부해주세요'}
          </span>
          {fileName && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
              aria-label="파일 삭제"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6.39953 18.6514L5.3457 17.5976L10.9457 11.9976L5.3457 6.39758L6.39953 5.34375L11.9995 10.9437L17.5995 5.34375L18.6534 6.39758L13.0534 11.9976L18.6534 17.5976L17.5995 18.6514L11.9995 13.0514L6.39953 18.6514Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          className={styles.selectButton}
          onClick={handleSelectClick}
        >
          파일 선택
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import styles from './ImageUploader.module.css'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 5

export default function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const fileName = value?.name ?? ''
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
    onChange?.(file)
  }

  function handleRemove() {
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
              <Image
                src="/icons/type_close.svg"
                alt=""
                width={24}
                height={24}
              />
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

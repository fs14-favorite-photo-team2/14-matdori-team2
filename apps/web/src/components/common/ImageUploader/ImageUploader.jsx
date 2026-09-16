'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ImageUploader.module.css'

const MAX_IMAGES = 10
const OUTPUT_WIDTH = 360
const OUTPUT_HEIGHT = 270
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.01

let nextId = 0
function createId() {
  nextId += 1
  return `img-${nextId}`
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function cropImageToFile(img, zoom, fileName) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_WIDTH
    canvas.height = OUTPUT_HEIGHT
    const ctx = canvas.getContext('2d')

    const { naturalWidth, naturalHeight } = img
    const coverScale = Math.max(
      OUTPUT_WIDTH / naturalWidth,
      OUTPUT_HEIGHT / naturalHeight,
    )
    const scale = coverScale * zoom

    const drawWidth = naturalWidth * scale
    const drawHeight = naturalHeight * scale
    const offsetX = (OUTPUT_WIDTH - drawWidth) / 2
    const offsetY = (OUTPUT_HEIGHT - drawHeight) / 2

    ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        resolve(
          new File([blob], fileName || 'cropped.jpg', { type: 'image/jpeg' }),
        )
      },
      'image/jpeg',
      0.9,
    )
  })
}

export default function ImageUploader({ onChange, onProcessingChange }) {
  const inputRef = useRef(null)
  const imgRefs = useRef({})

  const [images, setImages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState('')
  const [processingIds, setProcessingIds] = useState(() => new Set())

  useEffect(() => {
    onProcessingChange?.(processingIds.size > 0)
  }, [processingIds, onProcessingChange])

  const activeImage = images.find((img) => img.id === activeId) ?? null
  const zoomPercent = activeImage
    ? Math.round((activeImage.zoom / MIN_ZOOM) * 100)
    : 100

  const imagesRef = useRef(images)
  useEffect(() => {
    imagesRef.current = images
  })

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ])

  function validateFile(file) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return 'JPEG, PNG, WebP, HEIC, HEIF 이미지 파일만 업로드할 수 있습니다.'
    }
    return ''
  }

  function emitChange(imageList) {
    onChange?.(imageList.map((img) => img.croppedFile))
  }

  function handleSelectClick() {
    if (images.length >= MAX_IMAGES) return
    inputRef.current?.click()
  }

  async function handleFileChange(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - images.length
    const filesToAdd = files.slice(0, remainingSlots)

    const validFiles = []
    for (const file of filesToAdd) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }
      validFiles.push(file)
    }
    if (validFiles.length === 0) return
    setError('')

    const newImages = validFiles.map((file) => ({
      id: createId(),
      rawFile: file,
      previewUrl: URL.createObjectURL(file),
      zoom: MIN_ZOOM,
      croppedFile: file,
    }))

    const updated = [...images, ...newImages]
    setImages(updated)
    setActiveId(newImages[0].id)
    emitChange(updated)

    setProcessingIds((prev) => {
      const next = new Set(prev)
      newImages.forEach((img) => next.add(img.id))
      return next
    })

    await Promise.all(
      newImages.map(async (newImg) => {
        try {
          const imgEl = await loadImageElement(newImg.previewUrl)
          const croppedFile = await cropImageToFile(
            imgEl,
            MIN_ZOOM,
            newImg.rawFile?.name,
          )
          if (!croppedFile) return

          setImages((prev) => {
            const next = prev.map((img) =>
              img.id === newImg.id ? { ...img, croppedFile } : img,
            )
            emitChange(next)
            return next
          })
        } catch (err) {
          console.error('이미지 크롭 실패:', err)
          setError(
            '이미지를 처리하는 중 문제가 발생했습니다. 다시 시도해주세요.',
          )
          // 실패한 이미지는 목록/선택에서 제거
          setImages((prev) => {
            const next = prev.filter((img) => img.id !== newImg.id)
            emitChange(next)
            setActiveId((current) =>
              current === newImg.id ? (next[0]?.id ?? null) : current,
            )
            return next
          })
          URL.revokeObjectURL(newImg.previewUrl)
        } finally {
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(newImg.id)
            return next
          })
        }
      }),
    )
  }

  function handleSelectThumbnail(id) {
    setActiveId(id)
  }

  function handleRemove(id) {
    const target = images.find((img) => img.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)

    const updated = images.filter((img) => img.id !== id)
    setImages(updated)
    setActiveId((current) =>
      current === id ? (updated[0]?.id ?? null) : current,
    )
    emitChange(updated)

    setProcessingIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleZoomChange(event) {
    if (!activeImage) return
    const zoom = Number(event.target.value)
    setImages((prev) =>
      prev.map((img) => (img.id === activeImage.id ? { ...img, zoom } : img)),
    )
  }

  function handleZoomCommit() {
    if (!activeImage) return
    const imgEl = imgRefs.current[activeImage.id]
    if (!imgEl) return

    const id = activeImage.id
    setProcessingIds((prev) => new Set(prev).add(id))

    cropImageToFile(imgEl, activeImage.zoom, activeImage.rawFile?.name)
      .then((croppedFile) => {
        if (!croppedFile) return
        setImages((prev) => {
          const next = prev.map((img) =>
            img.id === id ? { ...img, croppedFile } : img,
          )
          emitChange(next)
          return next
        })
      })
      .catch((err) => {
        console.error('줌 크롭 실패:', err)
        setError('사진 크기 조정 중 문제가 발생했습니다. 다시 시도해주세요.')
      })
      .finally(() => {
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      })
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {!activeImage ? (
        <button
          type="button"
          className={styles.uploadBox}
          onClick={handleSelectClick}
        >
          <span className={styles.plusIcon}>+</span>
          <span className={styles.uploadText}>사진 업로드</span>
        </button>
      ) : (
        <div className={styles.previewCard}>
          <div className={styles.previewFrame}>
            <img
              ref={(el) => {
                imgRefs.current[activeImage.id] = el
              }}
              src={activeImage.previewUrl}
              alt="업로드 미리보기"
              className={styles.previewImage}
              style={{ transform: `scale(${activeImage.zoom})` }}
            />
          </div>

          <div className={styles.zoomRow}>
            <span className={styles.zoomLabel}>사진 크기</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={activeImage.zoom}
              onChange={handleZoomChange}
              onMouseUp={handleZoomCommit}
              onTouchEnd={handleZoomCommit}
              className={styles.zoomSlider}
            />
            <span className={styles.zoomPercent}>{zoomPercent}%</span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(activeImage.id)}
            >
              사진 삭제
            </button>
            <button
              type="button"
              className={styles.changeButton}
              onClick={handleSelectClick}
              disabled={images.length >= MAX_IMAGES}
            >
              사진 추가
            </button>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.thumbnailRow}>
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`${styles.thumbnail} ${img.id === activeId ? styles.thumbnailActive : ''}`}
              onClick={() => handleSelectThumbnail(img.id)}
            >
              <img
                src={img.previewUrl}
                alt=""
                className={styles.thumbnailImage}
              />

              {index === 0 ? (
                <span className={styles.thumbnailBadge}>썸네일</span>
              ) : (
                <span />
              )}

              <button
                type="button"
                className={styles.thumbnailRemove}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(img.id)
                }}
                aria-label="이미지 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className={styles.countText}>
        {images.length} / {MAX_IMAGES}
      </p>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}

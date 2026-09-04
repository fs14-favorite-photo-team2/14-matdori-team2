'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ImageUploader.module.css'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE_MB = 5
const MAX_IMAGES = 10
const OUTPUT_SIZE = 400
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.01

let nextId = 0
function createId() {
  nextId += 1
  return `img-${nextId}`
}

export default function ImageUploader({ onChange }) {
  const inputRef = useRef(null)
  const imgRefs = useRef({})
  const canvasRef = useRef(null)

  const [images, setImages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [error, setError] = useState('')

  const activeImage = images.find((img) => img.id === activeId) ?? null
  const zoomPercent = activeImage
    ? Math.round((activeImage.zoom / MIN_ZOOM) * 100)
    : 100

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'jpg, png 형식만 업로드 할 수 있어요'
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${MAX_SIZE_MB}MB 이하 파일만 업로드 할 수 있어요.`
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

  function handleFileChange(event) {
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
    const img = imgRefs.current[activeImage.id]
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE

    const { naturalWidth, naturalHeight } = img
    const coverScale = Math.max(
      OUTPUT_SIZE / naturalWidth,
      OUTPUT_SIZE / naturalHeight,
    )
    const scale = coverScale * activeImage.zoom

    const drawWidth = naturalWidth * scale
    const drawHeight = naturalHeight * scale
    const offsetX = (OUTPUT_SIZE - drawWidth) / 2
    const offsetY = (OUTPUT_SIZE - drawHeight) / 2

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const croppedFile = new File(
          [blob],
          activeImage.rawFile?.name || 'cropped.jpg',
          { type: 'image/jpeg' },
        )
        setImages((prev) => {
          const updated = prev.map((img) =>
            img.id === activeImage.id ? { ...img, croppedFile } : img,
          )
          emitChange(updated)
          return updated
        })
      },
      'image/jpeg',
      0.9,
    )
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
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
          {images.map((img) => (
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

      <canvas ref={canvasRef} className={styles.hiddenCanvas} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal/Modal'
import styles from './SaleRegistrationModal.module.css'
import Image from 'next/image'
import Button from '@/components/common/Button/Button'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import FormSelect from '@/components/common/FormSelect/FormSelect'

export default function SaleRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  selectedRecipe,
}) {
  const [saleQuantity, setSaleQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [desiredDifficulty, setDesiredDifficulty] = useState('')
  const [desiredCategory, setDesiredCategory] = useState('')
  const [exchangeDescription, setExchangeDescription] = useState('')

  if (!selectedRecipe) return null

  const maxSaleQuantity = selectedRecipe.availableQuantity

  function handleDecreaseQuantity() {
    setSaleQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))
  }

  function handleIncreaseQuantity() {
    setSaleQuantity((currentQuantity) =>
      Math.min(maxSaleQuantity, currentQuantity + 1),
    )
  }

  function handlePriceChange(event) {
    const numberOnlyValue = event.target.value.replace(/\D/g, '')

    if (numberOnlyValue === '' || Number(numberOnlyValue) <= 20) {
      setUnitPrice(numberOnlyValue)
    }
  }

  function handleResetExchangeInfo() {
    setDesiredDifficulty('')
    setDesiredCategory('')
    setExchangeDescription('')
  }

  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === selectedRecipe.difficulty,
  )

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === selectedRecipe.category,
  )

  const numericUnitPrice = Number(unitPrice)

  const isUnitPriceValid =
    unitPrice !== '' && numericUnitPrice >= 1 && numericUnitPrice <= 20

  const hasAnyExchangeInfo =
    desiredDifficulty !== '' ||
    desiredCategory !== '' ||
    exchangeDescription.trim() !== ''

  const hasCompleteExchangeInfo =
    desiredDifficulty !== '' &&
    desiredCategory !== '' &&
    exchangeDescription.trim() !== ''

  const isExchangeInfoValid = !hasAnyExchangeInfo || hasCompleteExchangeInfo

  const isFormValid = isUnitPriceValid && isExchangeInfoValid

  function handleSubmit() {
    if (!isFormValid) return

    onSubmit?.({
      recipeId: selectedRecipe.recipeId,
      quantity: saleQuantity,
      unitPrice: numericUnitPrice,
      listingType: hasCompleteExchangeInfo ? 'BOTH' : 'SALE',
      desiredDifficulty: hasCompleteExchangeInfo ? desiredDifficulty : null,
      desiredCategory: hasCompleteExchangeInfo ? desiredCategory : null,
      exchangeDescription: hasCompleteExchangeInfo
        ? exchangeDescription.trim()
        : null,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="large"
      ariaLabel="레시피 판매 정보 입력"
    >
      <header className={styles.header}>
        <p className={`${styles.pageLabel} font-baskin-robbins`}>
          나의 레시피 판매하기
        </p>
        <h2 className={`${styles.title} font-baskin-robbins`}>
          {selectedRecipe.title}
        </h2>
      </header>
      <section className={styles.recipeSummary}>
        <div className={styles.imageWrapper}>
          <Image
            src={selectedRecipe.thumbnailUrl}
            alt={selectedRecipe.title}
            fill
            sizes="(max-width: 743px) 100vw, 50vw"
            className={styles.recipeImage}
          />
        </div>

        <div className={styles.recipeInfo}>
          <div className={styles.metaRow}>
            <strong
              className={`${styles.difficulty} ${
                styles[difficultyOption?.tone] ?? ''
              }`}
            >
              {difficultyOption?.label}
            </strong>

            <span className={styles.divider}>|</span>
            <span>{categoryOption?.label}</span>

            <span className={styles.sellerNickname}>
              {selectedRecipe.creatorNickname}
            </span>
          </div>
          <div className={styles.saleSettings}>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>총 판매 수량</span>

              <div className={styles.quantityArea}>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={saleQuantity <= 1}
                    aria-label="판매 수량 줄이기"
                  >
                    -
                  </button>

                  <strong>{saleQuantity}</strong>

                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={saleQuantity >= maxSaleQuantity}
                    aria-label="판매 수량 늘리기"
                  >
                    +
                  </button>
                </div>

                <div className={styles.quantityLimit}>
                  <strong>/ {maxSaleQuantity}</strong>
                  <span>최대 {maxSaleQuantity}장</span>
                </div>
              </div>
            </div>

            <label className={styles.settingRow}>
              <span className={styles.settingLabel}>장당 가격</span>

              <div className={styles.priceInputWrapper}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={unitPrice}
                  onChange={handlePriceChange}
                  placeholder="1 ~ 20 숫자만 입력"
                  aria-label="장당 가격"
                />

                <span>P</span>
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.exchangeSection}>
        <div className={styles.exchangeHeader}>
          <h3 className={`${styles.exchangeTitle} font-baskin-robbins`}>
            교환 희망 정보 (선택)
          </h3>

          <button
            type="button"
            className={styles.exchangeResetButton}
            onClick={handleResetExchangeInfo}
            disabled={!hasAnyExchangeInfo}
          >
            입력 초기화
          </button>
        </div>

        <div className={styles.exchangeSelectGrid}>
          <label className={styles.exchangeField}>
            <span>난이도</span>

            <FormSelect
              options={DIFFICULTY_OPTIONS}
              value={desiredDifficulty}
              onChange={setDesiredDifficulty}
              placeholder="난이도를 선택해 주세요"
            />
          </label>

          <label className={styles.exchangeField}>
            <span>카테고리</span>

            <FormSelect
              options={CATEGORY_OPTIONS}
              value={desiredCategory}
              onChange={setDesiredCategory}
              placeholder="카테고리를 선택해 주세요"
            />
          </label>
        </div>

        <label className={styles.exchangeField}>
          <span>교환 희망 설명</span>

          <textarea
            className={styles.exchangeDescription}
            value={exchangeDescription}
            onChange={(event) => setExchangeDescription(event.target.value)}
            placeholder="교환을 희망하는 레시피를 설명해 주세요"
          />
        </label>
      </section>

      <footer className={styles.footer}>
        <Button type="button" variant="secondary" onClick={onClose}>
          취소하기
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          판매하기
        </Button>
      </footer>
    </Modal>
  )
}

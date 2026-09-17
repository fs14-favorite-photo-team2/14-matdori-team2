'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal/Modal'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import Button from '@/components/common/Button/Button'
import styles from './ExchangeOfferModal.module.css'

const MAX_DESCRIPTION_LENGTH = 500

export default function ExchangeOfferModal({
  isOpen,
  onClose,
  selectedRecipe,
  onSubmit,
  isPending = false,
}) {
  const [description, setDescription] = useState('')

  if (!selectedRecipe) return null

  const trimmedDescription = description.trim()
  const isDescriptionTooLong =
    trimmedDescription.length > MAX_DESCRIPTION_LENGTH

  const isFormValid = trimmedDescription !== '' && !isDescriptionTooLong

  function handleClose() {
    if (isPending) return

    setDescription('')
    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid || isPending) return

    onSubmit({
      recipe: selectedRecipe,
      description: trimmedDescription,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="large"
      ariaLabel="레시피 교환 제시 입력"
    >
      <header className={styles.header}>
        <p className={`${styles.pageLabel} font-baskin-robbins`}>
          레시피 교환하기
        </p>

        <h2 className={`${styles.title} font-baskin-robbins`}>
          {selectedRecipe.title}
        </h2>
      </header>

      <section className={styles.content}>
        <div className={styles.recipeCard}>
          <RecipeCard
            thumbnailUrl={selectedRecipe.thumbnailUrl}
            title={selectedRecipe.title}
            difficulty={selectedRecipe.difficulty}
            category={selectedRecipe.category}
            sellerNickname={selectedRecipe.creatorNickname}
            remainingQuantity={selectedRecipe.availableQuantity}
            quantityLabel="수량"
          />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.descriptionField} htmlFor="tradeDescription">
            <span>교환 제시 내용</span>

            <textarea
              id="tradeDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="내용을 입력해 주세요"
              aria-invalid={isDescriptionTooLong}
              aria-describedby={
                isDescriptionTooLong ? 'trade-description-error' : undefined
              }
            />

            {isDescriptionTooLong && (
              <p id="trade-description-error" className={styles.errorText}>
                교환 제시 내용은 500자 이하로 입력해 주세요.
              </p>
            )}
          </label>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              취소하기
            </Button>

            <Button type="submit" disabled={!isFormValid || isPending}>
              {isPending ? '교환 중...' : '교환하기'}
            </Button>
          </div>
        </form>
      </section>
    </Modal>
  )
}

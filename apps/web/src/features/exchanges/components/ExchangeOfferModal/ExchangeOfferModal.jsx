'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal/Modal'
import RecipeCard from '@/components/common/RecipeCard/RecipeCard'
import Button from '@/components/common/Button/Button'
import styles from './ExchangeOfferModal.module.css'

export default function ExchangeOfferModal({
  isOpen,
  onClose,
  selectedRecipe,
  onSubmit,
}) {
  const [description, setDescription] = useState('')

  if (!selectedRecipe) return null

  const trimmedDescription = description.trim()
  const isFormValid = trimmedDescription !== ''

  function handleClose() {
    setDescription('')
    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid) return

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
            />
          </label>

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소하기
            </Button>

            <Button type="submit" disabled={!isFormValid}>
              교환하기
            </Button>
          </div>
        </form>
      </section>
    </Modal>
  )
}

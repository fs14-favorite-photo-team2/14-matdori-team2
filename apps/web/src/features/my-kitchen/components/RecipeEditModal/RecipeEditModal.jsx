'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal/Modal'
import Image from 'next/image'
import FormSelect from '@/components/common/FormSelect/FormSelect'
import Button from '@/components/common/Button/Button'
import ImageUploader from '@/components/common/ImageUploader/ImageUploader'
import styles from './RecipeEditModal.module.css'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'

let nextIngredientId = 0

function createIngredient(ingredient = {}) {
  nextIngredientId += 1

  return {
    id: `ingredient-${nextIngredientId}`,
    name: ingredient.name ?? '',
    amount: ingredient.amount ?? '',
    isHighlight: ingredient.isHighlight ?? false,
  }
}

export default function RecipeEditModal({
  isOpen,
  onClose,
  recipe,
  onSubmit,
  isSubmitting = false,
}) {
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? '')
  const [category, setCategory] = useState(recipe?.category ?? '')
  const [summary, setSummary] = useState(recipe?.summary ?? '')
  const [content, setContent] = useState(recipe?.content ?? '')
  const [ingredients, setIngredients] = useState(() =>
    recipe?.ingredients?.length > 0
      ? recipe.ingredients.map(createIngredient)
      : [createIngredient()],
  )
  const [imageFiles, setImageFiles] = useState([])

  const hasImages = imageFiles.length > 0 || recipe?.imageUrls?.length > 0

  const isIngredientListValid = ingredients.every(
    (ingredient) =>
      ingredient.name.trim() !== '' && ingredient.amount.trim() !== '',
  )

  const hasHighlightedIngredient = ingredients.some(
    (ingredient) => ingredient.isHighlight,
  )

  const isFormValid =
    title.trim() !== '' &&
    difficulty !== '' &&
    category !== '' &&
    hasImages &&
    summary.trim() !== '' &&
    content.trim() !== '' &&
    ingredients.length > 0 &&
    isIngredientListValid &&
    hasHighlightedIngredient

  function handleIngredientChange(id, field, value) {
    setIngredients((previousIngredients) =>
      previousIngredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    )
  }

  function handleAddIngredient() {
    setIngredients((previousIngredients) => [
      ...previousIngredients,
      createIngredient({}, previousIngredients.length),
    ])
  }

  function handleRemoveIngredient(id) {
    setIngredients((previousIngredients) => {
      if (previousIngredients.length === 1) {
        return previousIngredients
      }

      return previousIngredients.filter((ingredient) => ingredient.id !== id)
    })
  }

  function handleToggleHighlight(id) {
    setIngredients((previousIngredients) =>
      previousIngredients.map((ingredient) =>
        ingredient.id === id
          ? {
              ...ingredient,
              isHighlight: !ingredient.isHighlight,
            }
          : ingredient,
      ),
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid || isSubmitting) return

    onSubmit({
      title: title.trim(),
      difficulty,
      category,
      summary: summary.trim(),
      content: content.trim(),
      ingredients: ingredients.map(({ name, amount, isHighlight }) => ({
        name: name.trim(),
        amount: amount.trim(),
        isHighlight,
      })),
      imageFiles,
    })
  }

  if (!recipe) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="레시피 수정"
      variant="large"
      ariaLabel="레시피 수정"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-recipe-title">
            레시피 이름
          </label>

          <input
            id="edit-recipe-title"
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="레시피 이름을 입력해 주세요"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>난이도</span>

            <FormSelect
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              placeholder="난이도를 선택해 주세요"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>카테고리</span>

            <FormSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              placeholder="카테고리를 선택해 주세요"
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>사진 수정</span>

          {imageFiles.length === 0 && recipe.imageUrls?.length > 0 && (
            <div className={styles.currentImages}>
              {recipe.imageUrls.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className={styles.currentImage}
                >
                  <Image
                    src={imageUrl}
                    alt={`${recipe.title} 기존 이미지 ${index + 1}`}
                    fill
                    sizes="120px"
                    className={styles.currentImageContent}
                  />

                  {index === 0 && (
                    <span className={styles.thumbnailBadge}>현재 썸네일</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className={styles.imageGuide}>
            새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.
            <br />새 이미지를 선택하면 기존 이미지 전체가 교체됩니다.
          </p>

          <ImageUploader
            initialCount={recipe.imageUrls?.length ?? 0}
            onChange={setImageFiles}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.hintBox}>
            <span aria-hidden="true">⭐</span>
            <span>하이라이트 재료를 1개 이상 선택해 주세요.</span>
          </div>

          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className={styles.ingredientRow}>
              <div className={styles.ingredientRowGrid}>
                <button
                  type="button"
                  className={`${styles.highlightButton} ${styles.areaHighlight}`}
                  onClick={() => handleToggleHighlight(ingredient.id)}
                  aria-pressed={ingredient.isHighlight}
                >
                  재료명 {ingredient.isHighlight ? '⭐' : '☆'}
                </button>

                <span className={`${styles.label} ${styles.areaAmountLabel}`}>
                  수량
                </span>

                <input
                  className={`${styles.input} ${styles.areaNameInput}`}
                  value={ingredient.name}
                  onChange={(event) =>
                    handleIngredientChange(
                      ingredient.id,
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="재료를 입력해 주세요"
                  aria-label="재료명"
                />

                <input
                  className={`${styles.input} ${styles.areaAmountInput}`}
                  value={ingredient.amount}
                  onChange={(event) =>
                    handleIngredientChange(
                      ingredient.id,
                      'amount',
                      event.target.value,
                    )
                  }
                  placeholder="수량을 입력해 주세요"
                  aria-label="재료 수량"
                />
              </div>

              <button
                type="button"
                className={styles.removeIngredientButton}
                onClick={() => handleRemoveIngredient(ingredient.id)}
                disabled={ingredients.length === 1}
                aria-label={`${ingredient.name || '재료'} 삭제`}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className={styles.addIngredientButton}
            onClick={handleAddIngredient}
          >
            재료 추가
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-recipe-summary">
            요리 소개
          </label>

          <textarea
            id="edit-recipe-summary"
            className={styles.textarea}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="요리에 대한 설명을 입력해 주세요"
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-recipe-content">
            레시피 상세
          </label>

          <textarea
            id="edit-recipe-content"
            className={`${styles.textarea} ${styles.contentTextarea}`}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="상세 레시피를 입력해 주세요"
            rows={8}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            className={styles.actionButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소하기
          </Button>

          <Button
            type="submit"
            variant="primary"
            className={styles.actionButton}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

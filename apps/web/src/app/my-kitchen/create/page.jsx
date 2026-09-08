'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button/Button'
import FormSelect from '@/components/common/FormSelect/FormSelect'
import ImageUploader from '@/components/common/ImageUploader/ImageUploader'
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from '@/constants/RecipeOptions'
import styles from './page.module.css'

const MAX_SUPPLY = 10

let nextIngredientId = 0
function createIngredientId() {
  nextIngredientId += 1
  return `ingredient-${nextIngredientId}`
}

function createEmptyIngredient() {
  return {
    id: createIngredientId(),
    name: '',
    amount: '',
    isHighlight: false,
  }
}

export default function CreateRecipePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [category, setCategory] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [ingredients, setIngredients] = useState(() =>
    Array.from({ length: 4 }, () => createEmptyIngredient()),
  )

  const isSupplyValid =
    totalSupply !== '' &&
    Number(totalSupply) > 0 &&
    Number(totalSupply) <= MAX_SUPPLY

  function isIngredientListValid(list) {
    return list.every(
      (ingredient) =>
        ingredient.name.trim() !== '' && ingredient.amount.trim() !== '',
    )
  }

  function hasHighlightedIngredient(list) {
    return list.some((ingredient) => ingredient.isHighlight)
  }

  const isFormValid =
    title.trim() !== '' &&
    difficulty !== '' &&
    category !== '' &&
    isSupplyValid &&
    imageFiles.length > 0 &&
    summary.trim() !== '' &&
    content.trim() !== '' &&
    isIngredientListValid(ingredients) &&
    hasHighlightedIngredient(ingredients)

  function handleIngredientChange(id, field, value) {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    )
  }

  function handleAddIngredient() {
    setIngredients((prev) => [...prev, createEmptyIngredient()])
  }

  function handleRemoveIngredient(id) {
    setIngredients((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((ingredient) => ingredient.id !== id)
    })
  }

  function handleToggleHighlight(id) {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, isHighlight: !ingredient.isHighlight }
          : ingredient,
      ),
    )
  }

  function handleBack() {
    router.back()
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!isFormValid) return

    const [thumbnailFile, ...otherImageFiles] = imageFiles

    const payload = {
      title,
      difficulty,
      category,
      totalSupply: Number(totalSupply),
      ingredients: ingredients.map(({ name, amount, isHighlight }) => ({
        name,
        amount,
        isHighlight,
      })),
      summary,
      content,
      thumbnailFile,
      imageFiles: otherImageFiles,
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <Image src="/icons/left.svg" alt="" width={24} height={24} />
        </button>

        <h1 className={`${styles.pageTitle} font-baskin-robbins`}>
          레시피 생성
        </h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            레시피 이름
          </label>
          <input
            id="title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="레시피 이름을 입력해 주세요"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>난이도</label>
            <FormSelect
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
              placeholder="난이도을 선택해 주세요"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <FormSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              placeholder="카테고리를 선택해 주세요"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="totalSupply">
            총 발행량
          </label>
          <input
            id="totalSupply"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`${styles.input} ${totalSupply !== '' && !isSupplyValid ? styles.inputError : ''}`}
            value={totalSupply}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '')
              setTotalSupply(onlyNums)
            }}
            placeholder="총 발행량을 입력해 주세요"
          />
          {totalSupply !== '' && !isSupplyValid && (
            <p className={styles.errorText}>
              총 발행량은 10장 이하로 선택 가능합니다.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>사진 업로드</span>
          <ImageUploader onChange={setImageFiles} />
        </div>

        <div className={styles.field}>
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className={styles.ingredientRow}>
              <div className={styles.ingredientRowGrid}>
                <button
                  type="button"
                  className={`${styles.highlightButton} ${styles.areaHighlight}`}
                  onClick={() => handleToggleHighlight(ingredient.id)}
                >
                  재료명 {ingredient.isHighlight ? '⭐' : '☆'}
                </button>
                <span className={`${styles.label} ${styles.areaQtyLabel}`}>
                  수량
                </span>

                <input
                  className={`${styles.input} ${styles.areaNameInput}`}
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      'name',
                      e.target.value,
                    )
                  }
                  placeholder="재료를 입력해 주세요"
                />
                <input
                  className={`${styles.input} ${styles.areaQtyInput}`}
                  value={ingredient.amount}
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      'amount',
                      e.target.value,
                    )
                  }
                  placeholder="수량을 입력해 주세요"
                />
              </div>

              <button
                type="button"
                className={styles.removeIngredientButton}
                onClick={() => handleRemoveIngredient(ingredient.id)}
                disabled={ingredients.length === 1}
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
            +
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="summary">
            요리 소개
          </label>
          <textarea
            id="summary"
            className={styles.textarea}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="요리에 대한 설명을 입력해 주세요"
            rows={4}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">
            레시피 상세
          </label>
          <textarea
            id="content"
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세 레시피를 입력해 주세요"
            rows={6}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={!isFormValid}
        >
          생성하기
        </Button>
      </form>
    </div>
  )
}

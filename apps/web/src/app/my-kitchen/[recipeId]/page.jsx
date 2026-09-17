'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import ErrorState from '@/components/common/ErrorState/ErrorState'
import useRecipeDetail from '@/features/my-kitchen/useRecipeDetail'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import Image from 'next/image'
import Button from '@/components/common/Button/Button'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import RecipeEditModal from '@/features/my-kitchen/components/RecipeEditModal/RecipeEditModal'
import Toast from '@/components/common/Toast/Toast'
import useUpdateRecipe from '@/features/my-kitchen/useUpdateRecipe'
import styles from './page.module.css'

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

export default function MyKitchenRecipeDetailPage() {
  const { recipeId } = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const {
    data: recipe,
    error,
    isConfigured,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useRecipeDetail(recipeId)

  const updateRecipeMutation = useUpdateRecipe(recipeId, {
    onSuccess: () => {
      setCurrentImageIndex(0)
      setIsEditModalOpen(false)
      setToastMessage('')
    },

    onError: (updateError) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }

      setToastMessage(
        getApiErrorMessage(
          updateError,
          '레시피 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        ),
      )

      toastTimerRef.current = setTimeout(() => {
        setToastMessage('')
        toastTimerRef.current = null
      }, 3000)
    },
  })

  if (!isConfigured) {
    return (
      <ErrorState
        title="API 연결 정보가 없습니다."
        message="NEXT_PUBLIC_API_URL 환경변수를 확인해 주세요."
      />
    )
  }

  if (isPending) {
    return (
      <ErrorState
        title="레시피 정보를 불러오는 중입니다."
        message="잠시만 기다려 주세요."
      />
    )
  }

  if (isError || !recipe) {
    return (
      <ErrorState
        title="레시피 정보를 불러오지 못했습니다."
        message={getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.')}
        actionLabel="다시 시도"
        onAction={refetch}
        isActionLoading={isRefetching}
      />
    )
  }

  const imageUrls = recipe.imageUrls ?? []
  const ingredients = recipe.ingredients ?? []

  if (imageUrls.length === 0) {
    return (
      <ErrorState
        title="레시피 이미지를 불러올 수 없습니다."
        message="등록된 레시피 이미지가 없습니다."
      />
    )
  }

  const imageCount = imageUrls.length
  const currentImageUrl = imageUrls[currentImageIndex]
  const hasMultipleImages = imageCount > 1

  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === recipe.difficulty,
  )

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === recipe.category,
  )

  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''

  const canEdit = recipe.canEdit === true

  function handlePreviousImage() {
    setCurrentImageIndex((currentIndex) =>
      currentIndex === 0 ? imageCount - 1 : currentIndex - 1,
    )
  }

  function handleNextImage() {
    setCurrentImageIndex((currentIndex) =>
      currentIndex === imageCount - 1 ? 0 : currentIndex + 1,
    )
  }

  function handleEdit() {
    setIsEditModalOpen(true)
  }

  function handleEditSubmit(values) {
    updateRecipeMutation.mutate(values)
  }

  return (
    <>
      {toastMessage && (
        <div className={styles.toastWrapper}>
          <Toast message={toastMessage} />
        </div>
      )}
      <main className={styles.container}>
        <header className={styles.detailHeader}>
          <p className={styles.breadcrumb}>마이키친</p>

          <div className={styles.titleRow}>
            <div className={styles.recipeInfo}>
              <h1 className={styles.title}>{recipe.title}</h1>

              <span className={styles.metaDivider} aria-hidden="true" />

              <span className={`${styles.difficulty} ${difficultyClassName}`}>
                {difficultyOption?.label ?? recipe.difficulty}
              </span>

              <span className={styles.metaDivider} aria-hidden="true" />

              <span className={styles.category}>
                {categoryOption?.label ?? recipe.category}
              </span>
            </div>

            {canEdit && (
              <Button
                type="button"
                variant="secondary"
                className={styles.editButton}
                onClick={handleEdit}
              >
                레시피 수정
              </Button>
            )}
          </div>
        </header>

        <section className={styles.gallerySection}>
          <div className={styles.imageStage}>
            <Image
              src={currentImageUrl}
              alt={`${recipe.title} ${currentImageIndex + 1}번째 이미지`}
              fill
              priority
              sizes="(max-width: 743px) 100vw, (max-width: 1023px) 80vw, 760px"
              className={styles.recipeImage}
            />

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  className={`${styles.carouselButton} ${styles.previousButton}`}
                  onClick={handlePreviousImage}
                  aria-label="이전 이미지 보기"
                >
                  <Image
                    src="/icons/recipe-carousel-prev.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>

                <button
                  type="button"
                  className={`${styles.carouselButton} ${styles.nextButton}`}
                  onClick={handleNextImage}
                  aria-label="다음 이미지 보기"
                >
                  <Image
                    src="/icons/recipe-carousel-next.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </>
            )}
          </div>

          <p className={styles.imageCounter}>
            {currentImageIndex + 1} / {imageCount}
          </p>
        </section>

        <section className={styles.recipeDetails}>
          <section
            className={styles.ingredientSection}
            aria-labelledby="ingredient-title"
          >
            <div className={styles.sectionHeader}>
              <h2 id="ingredient-title" className={styles.sectionTitle}>
                재료
              </h2>

              <span className={styles.itemCount}>{ingredients.length}개</span>
            </div>

            <ul className={styles.ingredientList}>
              {ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient.name}-${index}`}
                  className={styles.ingredientItem}
                >
                  <span
                    className={
                      ingredient.isHighlight ? styles.highlightIngredient : ''
                    }
                  >
                    {ingredient.name}
                  </span>

                  <span className={styles.ingredientAmount}>
                    {ingredient.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={styles.contentSection}
            aria-labelledby="recipe-content-title"
          >
            <div className={styles.sectionHeader}>
              <h2 id="recipe-content-title" className={styles.sectionTitle}>
                상세 레시피
              </h2>
            </div>

            <div className={styles.contentBox}>
              <p className={styles.recipeContent}>{recipe.content}</p>
            </div>
          </section>
        </section>
      </main>

      {isEditModalOpen && (
        <RecipeEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          recipe={recipe}
          onSubmit={handleEditSubmit}
          isSubmitting={updateRecipeMutation.isPending}
        />
      )}
    </>
  )
}

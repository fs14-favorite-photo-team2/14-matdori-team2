import Image from 'next/image'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import styles from './RecipeCard.module.css'

const BADGE_LABELS = {
  selling: '판매 중',
  exchangePending: '교환 제시 대기 중',
}

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

export default function RecipeCard({
  imageUrl,
  title,
  difficulty,
  category,
  sellerNickname,
  price,
  remainingQuantity = 0,
  badgeType,
  listingStatus,
}) {
  const badgeLabel = BADGE_LABELS[badgeType]
  const isSoldOut = listingStatus === 'SOLD_OUT'

  const displayedRemaining = isSoldOut ? 0 : remainingQuantity

  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === difficulty,
  )
  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === category,
  )
  const difficultyLabel = difficultyOption?.label ?? difficulty
  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''
  const categoryLabel = categoryOption?.label ?? category

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {badgeLabel && (
          <span
            className={`${styles.statusBadge} ${
              badgeType === 'exchangePending' ? styles.exchangePendingBadge : ''
            }`}
          >
            {badgeLabel}
          </span>
        )}

        <Image
          className={`${styles.recipeImage} ${
            isSoldOut ? styles.soldOutImage : ''
          }`}
          src={imageUrl}
          alt={title}
          width={500}
          height={375}
        />
        {isSoldOut && (
          <Image
            className={styles.soldOutBadge}
            src="/icons/sold-out.svg"
            alt="품절"
            width={140}
            height={140}
          />
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.metaRow}>
          <div className={styles.recipeMeta}>
            <span className={`${styles.difficulty} ${difficultyClassName}`}>
              {difficultyLabel}
            </span>

            <span className={styles.metaDivider}>|</span>

            <span className={styles.category}>{categoryLabel}</span>
          </div>

          {sellerNickname && (
            <span className={styles.sellerNickname}>{sellerNickname}</span>
          )}
        </div>

        <hr className={styles.divider} />

        <div className={styles.details}>
          {price !== null && price !== undefined && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>가격</span>
              <span className={styles.detailValue}>{price} P</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>잔여</span>
            <span className={styles.detailValue}>{displayedRemaining}</span>
          </div>
        </div>
      </div>

      <Image
        className={styles.brandLogo}
        src="/logos/matdori-logo.svg"
        alt="맛도리 마켓"
        width={135}
        height={30}
      />
    </article>
  )
}

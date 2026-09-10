import Image from 'next/image'
import Button from '@/components/common/Button/Button'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from '@/constants/RecipeOptions'
import {
  MOCK_CURRENT_USER,
  MOCK_LISTING_DETAIL,
} from '@/features/marketplace/mockListingDetail'
import SellerListingDetail from './SellerListingDetail'
import MobileHeader from '@/components/layout/Header/MobileHeader/MobileHeader'
import styles from './page.module.css'

const DIFFICULTY_CLASS_NAMES = {
  easy: styles.difficultyEasy,
  normal: styles.difficultyNormal,
  hard: styles.difficultyHard,
  master: styles.difficultyMaster,
}

export default function MarketplaceListingPage() {
  const listing = MOCK_LISTING_DETAIL
  const isSeller = MOCK_CURRENT_USER.id === listing.sellerId
  const { recipe, seller, myTradeOffers } = listing
  const thumbnailUrl = recipe.imageUrls[0]
  const difficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === recipe.difficulty,
  )

  const categoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === recipe.category,
  )

  const difficultyClassName =
    DIFFICULTY_CLASS_NAMES[difficultyOption?.tone] ?? ''

  const isSoldOut =
    listing.status === 'SOLD_OUT' || listing.remainingQuantity === 0

  const isExchangeAvailable = listing.listingType === 'BOTH'

  const wantedDifficultyOption = DIFFICULTY_OPTIONS.find(
    (option) => option.value === listing.wantedDifficulty,
  )

  const wantedCategoryOption = CATEGORY_OPTIONS.find(
    (option) => option.value === listing.wantedCategory,
  )

  const wantedDifficultyClassName =
    DIFFICULTY_CLASS_NAMES[wantedDifficultyOption?.tone] ?? ''

  if (isSeller) {
    return <SellerListingDetail listing={listing} />
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <MobileHeader title="마켓플레이스" backHref="/marketplace" />

        <p className={styles.pageLabel}>마켓플레이스</p>
        <h1 className={`${styles.title} font-baskin-robbins`}>
          {recipe.title}
        </h1>

        <section className={styles.productSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={thumbnailUrl}
              alt={recipe.title}
              fill //화면 꽉채우기
              preload //우선순위
              sizes="(max-width: 743px) 100vw, (max-width: 1023px) 50vw, 780px"
              className={styles.thumbnail}
            />
          </div>
          <div className={styles.productInfo}>
            <div className={styles.metaRow}>
              <div className={styles.recipeMeta}>
                <span className={`${styles.difficulty} ${difficultyClassName}`}>
                  {difficultyOption?.label ?? recipe.difficulty}
                </span>

                <span className={styles.metaDivider}>|</span>

                <span className={styles.category}>
                  {categoryOption?.label ?? recipe.category}
                </span>
              </div>

              <span className={styles.sellerNickname}>{seller.nickname}</span>
            </div>

            <div className={styles.summaryWrapper}>
              <p className={styles.summary}>{recipe.summary}</p>
            </div>

            <div className={styles.priceInfo}>
              <div className={styles.infoRow}>
                <div className={styles.infoLabel}>가격</div>
                <div className={styles.infoValue}>{listing.price} P</div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>잔여</span>
                <span className={styles.infoValue}>
                  {listing.remainingQuantity}
                </span>
              </div>
            </div>

            <Button
              type="button"
              className={styles.purchaseButton}
              disabled={isSoldOut}
            >
              레시피 구매하기
            </Button>
          </div>
        </section>

        <section className={styles.exchangeSection}>
          <div className={styles.exchangeHeader}>
            <h2 className={`${styles.exchangeTitle} font-baskin-robbins`}>
              교환 희망 정보
            </h2>

            <Button
              type="button"
              className={styles.exchangeButton}
              disabled={isSoldOut || !isExchangeAvailable}
            >
              레시피 교환하기
            </Button>
          </div>

          <div className={styles.exchangeContent}>
            <p className={styles.wantedDescription}>
              {isExchangeAvailable
                ? listing.wantedDescription
                : '교환을 희망하지 않습니다.'}
            </p>

            {isExchangeAvailable && (
              <div className={styles.wantedMeta}>
                <span
                  className={`${styles.difficulty} ${wantedDifficultyClassName}`}
                >
                  {wantedDifficultyOption?.label ?? listing.wantedDifficulty}
                </span>

                <span className={styles.metaDivider}>|</span>

                <span className={styles.category}>
                  {wantedCategoryOption?.label ?? listing.wantedCategory}
                </span>
              </div>
            )}
          </div>
        </section>

        {myTradeOffers.length > 0 && (
          <section className={styles.myTradeSection}>
            <h2 className={`${styles.tradeSectionTitle} font-baskin-robbins`}>
              내가 제시한 교환 목록
            </h2>

            <div className={styles.myTradeList}>
              {myTradeOffers.map((tradeOffer) => {
                const offeredRecipe = tradeOffer.offeredCopy.recipe
                const offeredThumbnailUrl = offeredRecipe.imageUrls[0]
                const offeredDifficultyOption = DIFFICULTY_OPTIONS.find(
                  (option) => option.value === offeredRecipe.difficulty,
                )

                const offeredCategoryOption = CATEGORY_OPTIONS.find(
                  (option) => option.value === offeredRecipe.category,
                )

                const offeredDifficultyClassName =
                  DIFFICULTY_CLASS_NAMES[offeredDifficultyOption?.tone] ?? ''

                return (
                  <article key={tradeOffer.id} className={styles.tradeCard}>
                    <div className={styles.tradeImageWrapper}>
                      <Image
                        src={offeredThumbnailUrl}
                        alt={offeredRecipe.title}
                        fill
                        sizes="(max-width: 1023px) 50vw, 360px"
                        className={styles.tradeImage}
                      />
                    </div>

                    <h3 className={styles.tradeCardTitle}>
                      {offeredRecipe.title}
                    </h3>

                    <div className={styles.tradeCardMeta}>
                      <div className={styles.tradeRecipeMeta}>
                        <span
                          className={`${styles.difficulty} ${offeredDifficultyClassName}`}
                        >
                          {offeredDifficultyOption?.label ??
                            offeredRecipe.difficulty}
                        </span>

                        <span className={styles.metaDivider}>|</span>

                        <span className={styles.category}>
                          {offeredCategoryOption?.label ??
                            offeredRecipe.category}
                        </span>
                      </div>

                      <span className={styles.proposerNickname}>
                        {tradeOffer.proposer.nickname}
                      </span>
                    </div>

                    <p className={styles.tradeDescription}>
                      {tradeOffer.description}
                    </p>

                    <Button
                      type="button"
                      variant="secondary"
                      className={styles.cancelTradeButton}
                    >
                      취소하기
                    </Button>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

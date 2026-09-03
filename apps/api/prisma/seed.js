import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

import { PrismaClient } from '../src/generated/prisma/client.ts'

config({ path: ['.env.local', '.env'] })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

// ============================================
// Seed configuration
// ============================================
//
// 현재 카테고리
// - KOREAN: 한식
// - WESTERN: 양식
// - CHINESE: 중식
// - JAPANESE: 일식
// - ASIAN: 아시안
// - HOME_BAKING: 홈 베이킹
// - BEVERAGE: 음료
// - SAUCE: 양념장
// - CONVENIENCE: 편의점
// - FUSION: 퓨전음식
//
// 현재 난이도
// - EASY: 쉬움
// - NORMAL: 보통
// - HARD: 어려움
// - MASTER: 마스터
//
// 생성 수
// - User: 100
// - Recipe: 100
// - RecipeImage: 550
// - RecipeCopy: 300
// - MarketListing: 100
// - Purchase: 100
// - TradeOffer: 100
// - Notification: 100
//
// 일반 이메일 계정의 공통 테스트 비밀번호: password
//
const USER_COUNT = 100
const RECIPE_COUNT = 100
const COPY_PER_RECIPE = 3
const LISTING_COUNT = 100
const MAX_IMAGE_COUNT = 10
const PURCHASE_COUNT = 100
const TRADE_OFFER_COUNT = 100
const NOTIFICATION_COUNT = 100

const SEED_PASSWORD_HASH =
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'

const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'MASTER']

const CATEGORIES = [
  'KOREAN',
  'WESTERN',
  'CHINESE',
  'JAPANESE',
  'ASIAN',
  'HOME_BAKING',
  'BEVERAGE',
  'SAUCE',
  'CONVENIENCE',
  'FUSION',
]

const DIFFICULTY_LABELS = {
  EASY: '쉬움',
  NORMAL: '보통',
  HARD: '어려움',
  MASTER: '마스터',
}

const CATEGORY_LABELS = {
  KOREAN: '한식',
  WESTERN: '양식',
  CHINESE: '중식',
  JAPANESE: '일식',
  ASIAN: '아시안',
  HOME_BAKING: '홈 베이킹',
  BEVERAGE: '음료',
  SAUCE: '양념장',
  CONVENIENCE: '편의점',
  FUSION: '퓨전음식',
}

// 카테고리별 10개씩, 총 100개
const RECIPE_NAMES = {
  KOREAN: [
    '김치찌개',
    '된장찌개',
    '제육볶음',
    '불고기',
    '비빔밥',
    '닭갈비',
    '떡볶이',
    '잡채',
    '갈비찜',
    '순두부찌개',
  ],

  WESTERN: [
    '토마토 파스타',
    '크림 파스타',
    '알리오 올리오',
    '라자냐',
    '스테이크',
    '리조또',
    '감바스',
    '로스트 치킨',
    '그라탱',
    '브루스케타',
  ],

  CHINESE: [
    '마파두부',
    '탕수육',
    '깐풍기',
    '유린기',
    '고추잡채',
    '짜장면',
    '짬뽕',
    '동파육',
    '마라샹궈',
    '멘보샤',
  ],

  JAPANESE: [
    '가츠동',
    '규동',
    '오야코동',
    '돈카츠',
    '오코노미야키',
    '야키소바',
    '우동',
    '카레라이스',
    '가라아게',
    '스키야키',
  ],

  ASIAN: [
    '팟타이',
    '똠얌꿍',
    '나시고렝',
    '미고렝',
    '반미',
    '분짜',
    '쌀국수',
    '카오팟',
    '그린커리',
    '월남쌈',
  ],

  HOME_BAKING: [
    '초코칩 쿠키',
    '휘낭시에',
    '마들렌',
    '스콘',
    '브라우니',
    '치즈케이크',
    '파운드케이크',
    '에그타르트',
    '머핀',
    '바나나 브레드',
  ],

  BEVERAGE: [
    '딸기 라떼',
    '말차 라떼',
    '바닐라 라떼',
    '레몬에이드',
    '자몽에이드',
    '복숭아 아이스티',
    '초코 라떼',
    '밀크티',
    '망고 스무디',
    '달고나 커피',
  ],

  SAUCE: [
    '만능 간장',
    '떡볶이 양념장',
    '비빔국수 양념장',
    '고기 쌈장',
    '데리야키 소스',
    '칠리소스',
    '유자 드레싱',
    '참깨 드레싱',
    '마늘 소스',
    '매콤 양념장',
  ],

  CONVENIENCE: [
    '불닭볶음면 볶음밥',
    '마크정식',
    '컵라면 계란찜',
    '참치마요 삼각김밥',
    '치즈 라면',
    '소시지 볶음밥',
    '스팸 김치덮밥',
    '콘치즈',
    '편의점 떡볶이',
    '컵누들 계란찜',
  ],

  FUSION: [
    '김치 크림 파스타',
    '불고기 피자',
    '떡볶이 리조또',
    '고추장 파스타',
    '김치 퀘사디아',
    '된장 크림 우동',
    '불닭 까르보나라',
    '제육 타코',
    '떡갈비 버거',
    '갈비 리조또',
  ],
}

function dateByIndex(index, hourStep = 18) {
  const start = Date.UTC(2026, 5, 1, 9, 0, 0)
  return new Date(start + index * hourStep * 60 * 60 * 1000)
}

function getListingStatus(index) {
  if (index < 50) return 'ON_SALE'
  if (index < 85) return 'SOLD_OUT'
  return 'WITHDRAWN'
}

function getListingType(index) {
  if (index >= 15 && index < 40) {
    return index % 2 === 0 ? 'BOTH' : 'EXCHANGE'
  }

  const types = ['SALE', 'EXCHANGE', 'BOTH']
  return types[index % types.length]
}

function getInitialQuantity(index) {
  if (index < 40) return 3
  if (index < 50) return 2
  return 1
}

function differentUser(users, excludedUserId, seed) {
  for (let offset = 0; offset < users.length; offset += 1) {
    const user = users[(seed + offset) % users.length]
    if (user.id !== excludedUserId) return user
  }

  throw new Error('다른 사용자를 찾지 못했습니다.')
}

async function clearDatabase() {
  console.log('기존 시드 데이터 삭제 중...')

  await prisma.notification.deleteMany()
  await prisma.tradeOffer.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.recipeCopy.deleteMany()
  await prisma.marketListing.deleteMany()
  await prisma.recipeImage.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.user.deleteMany()
}

async function seedUsers() {
  console.log('User 100개 생성 중...')

  const users = []

  for (let i = 0; i < USER_COUNT; i += 1) {
    const number = String(i + 1).padStart(3, '0')
    const isGoogleOnly = (i + 1) % 10 === 0

    const user = await prisma.user.create({
      data: {
        email: `seed-user-${number}@example.com`,
        passwordHash: isGoogleOnly ? null : SEED_PASSWORD_HASH,
        googleId: isGoogleOnly ? `google-seed-${number}` : null,
        nickname: `맛도리${number}`,
        points: ((i * 17) % 201) * 1000,
        lastRandomBoxClaimedAt: i % 4 === 0 ? null : dateByIndex(i, 12),
        createdAt: dateByIndex(i, 10),
      },
    })

    users.push(user)
  }

  return users
}

async function seedRecipes(users) {
  console.log('Recipe 100개 생성 중...')

  const recipes = []

  for (let i = 0; i < RECIPE_COUNT; i += 1) {
    const category = CATEGORIES[i % CATEGORIES.length]
    const difficulty = DIFFICULTIES[i % DIFFICULTIES.length]

    // 카테고리가 10개이므로 각 카테고리별로 10개씩 순서대로 사용
    const recipeIndexWithinCategory = Math.floor(i / CATEGORIES.length)
    const title = RECIPE_NAMES[category][recipeIndexWithinCategory]

    const creator = users[(i * 11 + 7) % users.length]
    const number = String(i + 1).padStart(3, '0')

    // 레시피마다 1장부터 10장까지 반복해서 생성
    const imageCount = (i % MAX_IMAGE_COUNT) + 1

    const recipe = await prisma.recipe.create({
      data: {
        creatorId: creator.id,
        title,
        minPrice: 1000 + (i % 10) * 500,
        difficulty,
        category,
        summary: `${CATEGORY_LABELS[category]} 카테고리의 ${title} 레시피입니다. ${DIFFICULTY_LABELS[difficulty]} 난이도로 구성되어 있습니다.`,
        content: [
          `1. ${title}에 필요한 재료를 준비합니다.`,
          '2. 재료를 깨끗하게 손질하고 조리 순서에 맞게 준비합니다.',
          '3. 불의 세기와 조리 시간을 조절하며 익힙니다.',
          '4. 간을 확인한 뒤 필요한 양념을 추가합니다.',
          '5. 완성된 음식을 보기 좋게 담아 마무리합니다.',
        ].join('\n'),
        totalSupply: COPY_PER_RECIPE,
        createdAt: dateByIndex(i, 14),

        images: {
          create: Array.from({ length: imageCount }, (_, imageIndex) => ({
            imageUrl: `https://picsum.photos/seed/recipe-${number}-${imageIndex + 1}/800/600`,
            sortOrder: imageIndex,
          })),
        },
      },
    })

    recipes.push(recipe)
  }

  return recipes
}

async function seedListings(users, recipes) {
  console.log('MarketListing 100개 생성 중...')

  const listings = []

  for (let i = 0; i < LISTING_COUNT; i += 1) {
    const recipe = recipes[i]
    const seller = users[(i * 7 + 13) % users.length]
    const listingType = getListingType(i)

    const wantedDifficulty =
      listingType === 'SALE'
        ? null
        : DIFFICULTIES[(i + 1) % DIFFICULTIES.length]

    const wantedCategory =
      listingType === 'SALE' ? null : CATEGORIES[(i + 2) % CATEGORIES.length]

    const listing = await prisma.marketListing.create({
      data: {
        sellerId: seller.id,
        recipeId: recipe.id,
        listingType,
        initialQuantity: getInitialQuantity(i),
        price: recipe.minPrice + 500 + (i % 8) * 500,
        wantedDifficulty,
        wantedCategory,
        wantedDescription:
          listingType === 'SALE'
            ? null
            : `${CATEGORY_LABELS[wantedCategory]} / ${DIFFICULTY_LABELS[wantedDifficulty]} 조건의 레시피와 교환을 희망합니다.`,
        status: getListingStatus(i),
        createdAt: dateByIndex(i, 16),
      },
    })

    listings.push(listing)
  }

  return listings
}

async function seedCopies(listings, recipes) {
  console.log('RecipeCopy 300개 생성 중...')

  const copies = []
  const copiesByRecipeIndex = []

  for (let i = 0; i < recipes.length; i += 1) {
    copiesByRecipeIndex[i] = []

    const listing = listings[i]

    for (let copyIndex = 0; copyIndex < COPY_PER_RECIPE; copyIndex += 1) {
      const copy = await prisma.recipeCopy.create({
        data: {
          recipeId: recipes[i].id,
          ownerId: listing.sellerId,
          state: 'OWNED',
          everPurchased: false,
          createdAt: dateByIndex(i * COPY_PER_RECIPE + copyIndex, 6),
        },
      })

      copies.push(copy)
      copiesByRecipeIndex[i].push(copy)
    }
  }

  return { copies, copiesByRecipeIndex }
}

async function seedPurchases(users, listings, copiesByRecipeIndex) {
  console.log('Purchase 100개 생성 중...')

  const purchases = []

  async function createPurchase(listingIndex, copyIndex, purchaseSeed) {
    const listing = listings[listingIndex]
    const copy = copiesByRecipeIndex[listingIndex][copyIndex]

    const buyer = differentUser(
      users,
      listing.sellerId,
      listingIndex * 19 + purchaseSeed * 7,
    )

    const purchase = await prisma.purchase.create({
      data: {
        listingId: listing.id,
        recipeCopyId: copy.id,
        buyerId: buyer.id,
        sellerId: listing.sellerId,
        price: listing.price,
        createdAt: dateByIndex(purchases.length + 20, 13),
      },
    })

    const updatedCopy = await prisma.recipeCopy.update({
      where: { id: copy.id },
      data: {
        ownerId: buyer.id,
        listingId: null,
        state: 'OWNED',
        everPurchased: true,
      },
    })

    Object.assign(copy, updatedCopy)
    purchases.push(purchase)
  }

  for (let i = 0; i < 50; i += 1) {
    await createPurchase(i, 0, i)
  }

  for (let i = 0; i < 15; i += 1) {
    await createPurchase(i, 1, i + 50)
  }

  for (let i = 50; i < 85; i += 1) {
    await createPurchase(i, 0, i + 20)
  }

  if (purchases.length !== PURCHASE_COUNT) {
    throw new Error(`Purchase 개수 오류: ${purchases.length}`)
  }

  return purchases
}

function getReservedListingCopyIds(copiesByRecipeIndex) {
  const reserved = new Set()

  for (let i = 0; i < 15; i += 1) {
    reserved.add(copiesByRecipeIndex[i][2].id)
  }

  for (let i = 15; i < 40; i += 1) {
    reserved.add(copiesByRecipeIndex[i][2].id)
  }

  for (let i = 40; i < 50; i += 1) {
    reserved.add(copiesByRecipeIndex[i][1].id)
  }

  return reserved
}

function findOfferCopy({
  copies,
  listing,
  reservedCopyIds,
  usedPairKeys,
  usedPendingCopyIds,
  pending = false,
  startIndex = 0,
  excludedCopyId = null,
}) {
  for (let offset = 0; offset < copies.length; offset += 1) {
    const copy = copies[(startIndex + offset) % copies.length]

    if (copy.id === excludedCopyId) continue
    if (reservedCopyIds.has(copy.id)) continue
    if (copy.state !== 'OWNED') continue
    if (copy.ownerId === listing.sellerId) continue
    if (pending && usedPendingCopyIds.has(copy.id)) continue

    const pairKey = `${listing.id}:${copy.id}`
    if (usedPairKeys.has(pairKey)) continue

    return copy
  }

  throw new Error(
    `교환 제시용 RecipeCopy를 찾지 못했습니다. listing=${listing.id}`,
  )
}

async function seedTradeOffers({ listings, copies, copiesByRecipeIndex }) {
  console.log('TradeOffer 100개 생성 중...')

  const tradeOffers = []
  const acceptedOffers = []
  const pendingOffers = []
  const refusedOffers = []
  const canceledOffers = []

  const reservedCopyIds = getReservedListingCopyIds(copiesByRecipeIndex)
  const usedPairKeys = new Set()
  const usedPendingCopyIds = new Set()

  // ACCEPTED 25개
  for (let i = 0; i < 25; i += 1) {
    const listingIndex = 15 + i
    const listing = listings[listingIndex]
    const receivedCopy = copiesByRecipeIndex[listingIndex][1]

    const offeredCopy = findOfferCopy({
      copies,
      listing,
      reservedCopyIds,
      usedPairKeys,
      usedPendingCopyIds,
      startIndex: 120 + i * 5,
      excludedCopyId: receivedCopy.id,
    })

    const proposerId = offeredCopy.ownerId
    const pairKey = `${listing.id}:${offeredCopy.id}`
    usedPairKeys.add(pairKey)

    const offer = await prisma.tradeOffer.create({
      data: {
        listingId: listing.id,
        proposerId,
        offeredCopyId: offeredCopy.id,
        receivedCopyId: receivedCopy.id,
        status: 'ACCEPTED',
        createdAt: dateByIndex(i + 40, 11),
        decidedAt: dateByIndex(i + 41, 11),
      },
    })

    const updatedOffered = await prisma.recipeCopy.update({
      where: { id: offeredCopy.id },
      data: {
        ownerId: listing.sellerId,
        listingId: null,
        state: 'OWNED',
      },
    })

    const updatedReceived = await prisma.recipeCopy.update({
      where: { id: receivedCopy.id },
      data: {
        ownerId: proposerId,
        listingId: null,
        state: 'OWNED',
      },
    })

    Object.assign(offeredCopy, updatedOffered)
    Object.assign(receivedCopy, updatedReceived)

    tradeOffers.push(offer)
    acceptedOffers.push(offer)
  }

  const tradeableListings = listings.filter(
    (listing) => listing.listingType !== 'SALE',
  )

  // PENDING 25개
  for (let i = 0; i < 25; i += 1) {
    const listing = tradeableListings[i % tradeableListings.length]

    const offeredCopy = findOfferCopy({
      copies,
      listing,
      reservedCopyIds,
      usedPairKeys,
      usedPendingCopyIds,
      pending: true,
      startIndex: 180 + i * 3,
    })

    const pairKey = `${listing.id}:${offeredCopy.id}`
    usedPairKeys.add(pairKey)
    usedPendingCopyIds.add(offeredCopy.id)

    const offer = await prisma.tradeOffer.create({
      data: {
        listingId: listing.id,
        proposerId: offeredCopy.ownerId,
        offeredCopyId: offeredCopy.id,
        receivedCopyId: null,
        status: 'PENDING',
        createdAt: dateByIndex(i + 70, 9),
      },
    })

    const updatedCopy = await prisma.recipeCopy.update({
      where: { id: offeredCopy.id },
      data: {
        state: 'OFFERED',
        listingId: null,
      },
    })

    Object.assign(offeredCopy, updatedCopy)

    tradeOffers.push(offer)
    pendingOffers.push(offer)
  }

  // REFUSED 25개
  for (let i = 0; i < 25; i += 1) {
    const listing = tradeableListings[(i + 25) % tradeableListings.length]

    const offeredCopy = findOfferCopy({
      copies,
      listing,
      reservedCopyIds,
      usedPairKeys,
      usedPendingCopyIds,
      startIndex: 40 + i * 7,
    })

    const pairKey = `${listing.id}:${offeredCopy.id}`
    usedPairKeys.add(pairKey)

    const offer = await prisma.tradeOffer.create({
      data: {
        listingId: listing.id,
        proposerId: offeredCopy.ownerId,
        offeredCopyId: offeredCopy.id,
        receivedCopyId: null,
        status: 'REFUSED',
        createdAt: dateByIndex(i + 95, 8),
        decidedAt: dateByIndex(i + 96, 8),
      },
    })

    tradeOffers.push(offer)
    refusedOffers.push(offer)
  }

  // CANCELED 25개
  for (let i = 0; i < 25; i += 1) {
    const listing = tradeableListings[(i + 50) % tradeableListings.length]

    const offeredCopy = findOfferCopy({
      copies,
      listing,
      reservedCopyIds,
      usedPairKeys,
      usedPendingCopyIds,
      startIndex: 80 + i * 11,
    })

    const pairKey = `${listing.id}:${offeredCopy.id}`
    usedPairKeys.add(pairKey)

    const offer = await prisma.tradeOffer.create({
      data: {
        listingId: listing.id,
        proposerId: offeredCopy.ownerId,
        offeredCopyId: offeredCopy.id,
        receivedCopyId: null,
        status: 'CANCELED',
        createdAt: dateByIndex(i + 120, 7),
        decidedAt: dateByIndex(i + 121, 7),
      },
    })

    tradeOffers.push(offer)
    canceledOffers.push(offer)
  }

  if (tradeOffers.length !== TRADE_OFFER_COUNT) {
    throw new Error(`TradeOffer 개수 오류: ${tradeOffers.length}`)
  }

  return {
    tradeOffers,
    acceptedOffers,
    pendingOffers,
    refusedOffers,
    canceledOffers,
  }
}

async function markCurrentListings(listings, copiesByRecipeIndex) {
  console.log('현재 판매 중인 RecipeCopy 상태 반영 중...')

  for (let i = 0; i < 50; i += 1) {
    const listing = listings[i]

    const currentCopy =
      i < 40 ? copiesByRecipeIndex[i][2] : copiesByRecipeIndex[i][1]

    const updatedCopy = await prisma.recipeCopy.update({
      where: { id: currentCopy.id },
      data: {
        ownerId: listing.sellerId,
        listingId: listing.id,
        state: 'LISTED',
      },
    })

    Object.assign(currentCopy, updatedCopy)
  }
}

async function seedNotifications({
  listings,
  purchases,
  pendingOffers,
  acceptedOffers,
  refusedOffers,
}) {
  console.log('Notification 100개 생성 중...')

  const notifications = []

  // PURCHASED 40개
  for (let i = 0; i < 40; i += 1) {
    const purchase = purchases[i]
    const listing = listings.find((item) => item.id === purchase.listingId)

    const notification = await prisma.notification.create({
      data: {
        userId: purchase.sellerId,
        type: 'PURCHASED',
        actorId: purchase.buyerId,
        recipeId: listing.recipeId,
        listingId: listing.id,
        purchaseId: purchase.id,
        tradeOfferId: null,
        isRead: i % 3 === 0,
        createdAt: new Date(purchase.createdAt.getTime() + 10 * 60 * 1000),
      },
    })

    notifications.push(notification)
  }

  // SOLD_OUT 10개
  for (let i = 50; i < 60; i += 1) {
    const listing = listings[i]

    const notification = await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'SOLD_OUT',
        actorId: null,
        recipeId: listing.recipeId,
        listingId: listing.id,
        purchaseId: null,
        tradeOfferId: null,
        isRead: i % 2 === 0,
        createdAt: dateByIndex(i + 140, 5),
      },
    })

    notifications.push(notification)
  }

  // TRADE_OFFER_NEW 20개
  for (let i = 0; i < 20; i += 1) {
    const offer = pendingOffers[i]
    const listing = listings.find((item) => item.id === offer.listingId)

    const notification = await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'TRADE_OFFER_NEW',
        actorId: offer.proposerId,
        recipeId: listing.recipeId,
        listingId: listing.id,
        purchaseId: null,
        tradeOfferId: offer.id,
        isRead: i % 4 === 0,
        createdAt: new Date(offer.createdAt.getTime() + 5 * 60 * 1000),
      },
    })

    notifications.push(notification)
  }

  // TRADE_OFFER_ACCEPT 15개
  for (let i = 0; i < 15; i += 1) {
    const offer = acceptedOffers[i]
    const listing = listings.find((item) => item.id === offer.listingId)

    const notification = await prisma.notification.create({
      data: {
        userId: offer.proposerId,
        type: 'TRADE_OFFER_ACCEPT',
        actorId: listing.sellerId,
        recipeId: listing.recipeId,
        listingId: listing.id,
        purchaseId: null,
        tradeOfferId: offer.id,
        isRead: i % 2 === 0,
        createdAt: new Date(offer.decidedAt.getTime() + 5 * 60 * 1000),
      },
    })

    notifications.push(notification)
  }

  // TRADE_OFFER_REFUSE 15개
  for (let i = 0; i < 15; i += 1) {
    const offer = refusedOffers[i]
    const listing = listings.find((item) => item.id === offer.listingId)

    const notification = await prisma.notification.create({
      data: {
        userId: offer.proposerId,
        type: 'TRADE_OFFER_REFUSE',
        actorId: listing.sellerId,
        recipeId: listing.recipeId,
        listingId: listing.id,
        purchaseId: null,
        tradeOfferId: offer.id,
        isRead: i % 3 === 0,
        createdAt: new Date(offer.decidedAt.getTime() + 5 * 60 * 1000),
      },
    })

    notifications.push(notification)
  }

  if (notifications.length !== NOTIFICATION_COUNT) {
    throw new Error(`Notification 개수 오류: ${notifications.length}`)
  }

  return notifications
}

async function printCounts() {
  const [
    users,
    recipes,
    recipeImages,
    copies,
    listings,
    purchases,
    tradeOffers,
    notifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.recipe.count(),
    prisma.recipeImage.count(),
    prisma.recipeCopy.count(),
    prisma.marketListing.count(),
    prisma.purchase.count(),
    prisma.tradeOffer.count(),
    prisma.notification.count(),
  ])

  console.log('\n============================================')
  console.log('Seed 완료')
  console.log('============================================')
  console.log(`User          : ${users}`)
  console.log(`Recipe        : ${recipes}`)
  console.log(`RecipeImage   : ${recipeImages}`)
  console.log(`RecipeCopy    : ${copies}`)
  console.log(`MarketListing : ${listings}`)
  console.log(`Purchase      : ${purchases}`)
  console.log(`TradeOffer    : ${tradeOffers}`)
  console.log(`Notification  : ${notifications}`)
  console.log('============================================')
  console.log('일반 테스트 계정 예시')
  console.log('email    : seed-user-001@example.com')
  console.log('password : password')
  console.log('============================================\n')
}

async function main() {
  await clearDatabase()

  const users = await seedUsers()
  const recipes = await seedRecipes(users)
  const listings = await seedListings(users, recipes)

  const { copies, copiesByRecipeIndex } = await seedCopies(listings, recipes)

  const purchases = await seedPurchases(users, listings, copiesByRecipeIndex)

  const { acceptedOffers, pendingOffers, refusedOffers } =
    await seedTradeOffers({
      listings,
      copies,
      copiesByRecipeIndex,
    })

  await markCurrentListings(listings, copiesByRecipeIndex)

  await seedNotifications({
    listings,
    purchases,
    pendingOffers,
    acceptedOffers,
    refusedOffers,
  })

  await printCounts()
}

main()
  .catch((error) => {
    console.error('Seed 실패')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

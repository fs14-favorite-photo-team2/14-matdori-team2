// TODO: GET /api/market-listings/:listingId 응답으로 교체
export const MOCK_CURRENT_USER = {
  id: 1,
  nickname: '유디',
}

export const MOCK_LISTING_DETAIL = {
  id: 1,
  sellerId: 2,
  listingType: 'BOTH',
  status: 'ON_SALE',
  price: 4,
  initialQuantity: 5,
  remainingQuantity: 2,
  wantedDifficulty: 'NORMAL',
  wantedCategory: 'JAPANESE',
  wantedDescription:
    '푸릇푸릇한 여름 일식, 눈 많이 내린 겨울 일식 사진에 관심이 많습니다.',
  seller: {
    id: 2,
    nickname: '미쓰손',
  },
  recipe: {
    id: 1,
    creatorId: 2,
    title: '해물 된장찌개',
    imageUrls: [
      '/images/marketplace/seafood-doenjang-stew.jpg',
      '/images/marketplace/seafood-paella.jpg',
      '/images/marketplace/gochujang-chicken-wings.jpg',
    ],
    difficulty: 'MASTER',
    category: 'JAPANESE',
    summary:
      '신선한 해물과 구수한 된장을 사용한 특별한 된장찌개입니다. 누구나 편하게 따라 만들 수 있도록 구성했으며 깊고 진한 국물 맛을 즐길 수 있습니다. 따뜻한 밥과 함께 먹기 좋은 든든한 한 끼 요리입니다. 소올직하게 쪼큼은 어려울 수 도 있습니다 어디 한번 따라해 보세요.',
    content: '재료와 조리 방법이 들어갈 상세 레시피 내용입니다.',
  },
  myTradeOffers: [
    {
      id: 101,
      status: 'PENDING',
      description:
        '새우빠에야 레시피도 좋은데, 해물 된장찌개 레시피와 교환하고 싶습니다.',
      proposer: {
        id: 1,
        nickname: '유디',
      },
      offeredCopy: {
        id: 201,
        recipe: {
          id: 2,
          title: '새우빠에야',
          imageUrls: ['/images/marketplace/seafood-paella.jpg'],
          difficulty: 'EASY',
          category: 'KOREAN',
        },
      },
    },
    {
      id: 102,
      status: 'PENDING',
      description:
        '고추장 닭날개 조림 레시피와 해물 된장찌개 레시피를 교환하고 싶어요.',
      proposer: {
        id: 1,
        nickname: '유디',
      },
      offeredCopy: {
        id: 202,
        recipe: {
          id: 3,
          title: '고추장 닭날개 조림',
          imageUrls: ['/images/marketplace/gochujang-chicken-wings.jpg'],
          difficulty: 'HARD',
          category: 'KOREAN',
        },
      },
    },
    {
      id: 103,
      status: 'PENDING',
      description:
        '말차 딸기 케이크 레시피로 해물 된장찌개 레시피를 교환하고 싶어요.',
      proposer: {
        id: 1,
        nickname: '유디',
      },
      offeredCopy: {
        id: 203,
        recipe: {
          id: 4,
          title: '말차 딸기 케이크',
          imageUrls: ['/images/marketplace/matcha-strawberry-cake.jpg'],
          difficulty: 'NORMAL',
          category: 'HOME_BAKING',
        },
      },
    },
  ],
}

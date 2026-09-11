// TODO: GET /api/market-listings/:listingId 응답으로 교체
// 상세 페이지의 구매자·판매자 화면 전환용 현재 사용자 목데이터
// 구매자 화면: id를 MOCK_LISTING_DETAIL.sellerId와 다르게 설정한다. (현재 값: 1)
// 판매자 화면: id를 MOCK_LISTING_DETAIL.sellerId와 같게 설정한다. (판매자 id: 2)
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
    ingredients: [
      {
        name: '모시조개',
        amount: '200g',
        isHighlight: false,
      },
      {
        name: '꽃게',
        amount: '1마리',
        isHighlight: true,
      },
      {
        name: '새우',
        amount: '5마리',
        isHighlight: true,
      },
      {
        name: '두부',
        amount: '1/2모',
        isHighlight: false,
      },
      {
        name: '애호박',
        amount: '1/2개',
        isHighlight: false,
      },
      {
        name: '청양고추',
        amount: '2개',
        isHighlight: false,
      },
      {
        name: '대파',
        amount: '1대',
        isHighlight: false,
      },
      {
        name: '된장',
        amount: '2큰술',
        isHighlight: false,
      },
      {
        name: '고춧가루',
        amount: '1큰술',
        isHighlight: false,
      },
      {
        name: '다진 마늘',
        amount: '1큰술',
        isHighlight: false,
      },
      {
        name: '멸치육수',
        amount: '4컵',
        isHighlight: false,
      },
    ],
    content: `1. 멸치와 다시마를 넣고 15분간 끓여 육수를 준비합니다.

2. 된장을 육수에 풀고 고춧가루와 다진 마늘을 함께 넣어줍니다.

3. 꽃게와 모시조개를 먼저 넣고 중불에서 끓여줍니다.

4. 두부와 애호박을 먹기 좋은 크기로 썰어 넣습니다.

5. 새우와 청양고추, 대파를 넣고 해산물이 익을 때까지 끓여 완성합니다.`,
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
  ],
}

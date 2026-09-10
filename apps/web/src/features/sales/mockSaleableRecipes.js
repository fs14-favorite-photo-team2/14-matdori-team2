// TODO: 판매 등록이 가능한 내 레시피 목록 조회 API 응답으로 교체
const RECIPE_SEEDS = [
  ['해물 된장찌개', 'NORMAL', 'KOREAN', 'seafood-doenjang-stew.jpg'],
  ['새우 빠에야', 'HARD', 'WESTERN', 'seafood-paella.jpg'],
  ['고추장 닭날개 조림', 'HARD', 'KOREAN', 'gochujang-chicken-wings.jpg'],
  ['말차 딸기 케이크', 'MASTER', 'HOME_BAKING', 'matcha-strawberry-cake.jpg'],
  ['돼지고기 김치찌개', 'EASY', 'KOREAN', 'seafood-doenjang-stew.jpg'],
  ['해산물 리소토', 'NORMAL', 'WESTERN', 'seafood-paella.jpg'],
  ['매콤한 닭봉구이', 'NORMAL', 'KOREAN', 'gochujang-chicken-wings.jpg'],
  ['말차 크림 롤케이크', 'HARD', 'HOME_BAKING', 'matcha-strawberry-cake.jpg'],
  ['바지락 된장국', 'EASY', 'KOREAN', 'seafood-doenjang-stew.jpg'],
  ['토마토 해산물 파스타', 'MASTER', 'WESTERN', 'seafood-paella.jpg'],
  ['궁보계정', 'HARD', 'CHINESE', 'gochujang-chicken-wings.jpg'],
  ['초콜릿 브라우니', 'NORMAL', 'HOME_BAKING', 'matcha-strawberry-cake.jpg'],
  ['규동', 'EASY', 'JAPANESE', 'seafood-doenjang-stew.jpg'],
  ['새우 팟타이', 'NORMAL', 'ASIAN', 'seafood-paella.jpg'],
  ['치킨 카차토레', 'HARD', 'WESTERN', 'gochujang-chicken-wings.jpg'],
  ['허니 바나나 브레드', 'EASY', 'HOME_BAKING', 'matcha-strawberry-cake.jpg'],
  ['오야코동', 'NORMAL', 'JAPANESE', 'seafood-doenjang-stew.jpg'],
  ['나시고렝', 'HARD', 'ASIAN', 'seafood-paella.jpg'],
  ['사천식 마파두부', 'MASTER', 'CHINESE', 'gochujang-chicken-wings.jpg'],
  ['크랜베리 스콘', 'NORMAL', 'HOME_BAKING', 'matcha-strawberry-cake.jpg'],
  ['아이스 흑임자 라테', 'EASY', 'BEVERAGE', 'seafood-doenjang-stew.jpg'],
  ['수제 쌈장', 'NORMAL', 'SAUCE', 'seafood-paella.jpg'],
  ['편의점 라면 볶음밥', 'EASY', 'CONVENIENCE', 'gochujang-chicken-wings.jpg'],
  ['김치 크림 파스타', 'MASTER', 'FUSION', 'matcha-strawberry-cake.jpg'],
]

export const MOCK_REGISTERED_LISTINGS_KEY = 'mockRegisteredMarketListings'

export const MOCK_SALEABLE_RECIPES = RECIPE_SEEDS.map(
  ([title, difficulty, category, imageName], index) => ({
    recipeId: 1001 + index,
    creatorId: 1,
    creatorNickname: '유디',
    title,
    thumbnailUrl: `/images/marketplace/${imageName}`,
    difficulty,
    category,
    availableQuantity: (index % 7) + 1,
  }),
)

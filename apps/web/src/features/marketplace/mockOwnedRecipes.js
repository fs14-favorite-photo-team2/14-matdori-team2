// TODO: 로그인 사용자가 보유한 recipe copy 목록 조회 API 응답으로 교체
export const MOCK_REGISTERED_LISTINGS_KEY = 'mockRegisteredMarketListings'

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

const CREATOR_NICKNAMES = ['유디', '미쓰손', '프로한식러', '팝스타']

function createRecipeCopies(recipeIndex) {
  const totalQuantity = (recipeIndex % 5) + 3

  return Array.from({ length: totalQuantity }, (_, copyIndex) => {
    let status = 'OWNED'

    // 일부 개별 카드는 판매 또는 교환 제시에 묶인 상태를 재현한다.
    if (copyIndex === 0 && recipeIndex % 4 === 0) status = 'LISTED'
    if (copyIndex === 1 && recipeIndex % 5 === 0) status = 'OFFERED'

    return {
      id: `recipe-copy-${recipeIndex + 1}-${copyIndex + 1}`,
      status,
      deletedAt: null,
    }
  })
}

export const MOCK_OWNED_RECIPES = RECIPE_SEEDS.map(
  ([title, difficulty, category, imageName], index) => ({
    recipeId: 1001 + index,
    creatorId: index < 12 ? 1 : 10 + index,
    creatorNickname:
      index < 12 ? '유디' : CREATOR_NICKNAMES[index % CREATOR_NICKNAMES.length],
    ownershipSource:
      index < 12 ? 'CREATED' : index % 2 === 0 ? 'PURCHASED' : 'EXCHANGED',
    title,
    thumbnailUrl: `/images/marketplace/${imageName}`,
    difficulty,
    category,
    // 삭제된 레시피가 두 선택 모달에서 모두 제외되는지 확인하기 위한 목데이터
    deletedAt:
      index >= RECIPE_SEEDS.length - 2 ? '2026-09-11T00:00:00.000Z' : null,
    copies: createRecipeCopies(index),
  }),
)

export function getAvailableCopies(recipe) {
  if (recipe.deletedAt !== null) return []

  return recipe.copies.filter(
    (copy) => copy.status === 'OWNED' && copy.deletedAt === null,
  )
}

export function toSelectableRecipe(recipe) {
  return {
    recipeId: recipe.recipeId,
    creatorId: recipe.creatorId,
    creatorNickname: recipe.creatorNickname,
    ownershipSource: recipe.ownershipSource,
    title: recipe.title,
    thumbnailUrl: recipe.thumbnailUrl,
    difficulty: recipe.difficulty,
    category: recipe.category,
    // 판매·교환 제시에 묶이지 않은 개별 카드만 선택 가능 수량에 포함한다.
    availableQuantity: getAvailableCopies(recipe).length,
  }
}

// 판매 등록 모달: 현재 사용자가 직접 생성한 레시피만 판매 대상으로 보여준다.
// 삭제됐거나 이미 판매·교환 제시에 묶인 개별 카드는 수량에서 제외한다.
export const MOCK_SALEABLE_RECIPES = MOCK_OWNED_RECIPES.filter(
  (recipe) =>
    recipe.ownershipSource === 'CREATED' &&
    recipe.deletedAt === null &&
    getAvailableCopies(recipe).length > 0,
).map(toSelectableRecipe)

// 교환 제시 모달: 직접 생성·구매·교환으로 보유하게 된 레시피를 모두 포함한다.
// 판매 등록과 마찬가지로 삭제됐거나 다른 거래에 묶인 개별 카드는 제외한다.
export const MOCK_EXCHANGEABLE_RECIPES = MOCK_OWNED_RECIPES.filter(
  (recipe) =>
    recipe.deletedAt === null && getAvailableCopies(recipe).length > 0,
).map(toSelectableRecipe)

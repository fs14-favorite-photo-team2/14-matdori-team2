export const SALE_EDIT_DETAIL_ERROR_MATCHERS = [
  '이미 구매된 사본은 다시 포인트로 판매할 수 없습니다.',
  /^현재 변경 가능한 최대 판매 수량은 \d+개입니다\.$/,
]

export const PURCHASE_DETAIL_ERROR_MATCHERS = [
  '현재 구매할 수 없는 판매글입니다.',
  '구매 가능한 레시피 사본이 없습니다.',
  '이미 보유한 레시피는 추가로 구매할 수 없습니다.',
  '보유 포인트가 부족합니다.',
  '다른 거래와 요청이 겹쳤습니다. 새로고침 후 다시 시도해 주세요.',
]

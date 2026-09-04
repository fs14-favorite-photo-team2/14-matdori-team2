export const DEFAULT_FILTERS = {
  difficulty: '',
  category: '',
  listingType: '',
  status: '',
}

export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: '요알못 구원자', tone: 'easy' },
  { value: 'NORMAL', label: '당당한 요린이', tone: 'normal' },
  { value: 'HARD', label: '숨은 집밥 고수', tone: 'hard' },
  { value: 'MASTER', label: '장금이의 후예', tone: 'master' },
]

export const CATEGORY_OPTIONS = [
  { value: 'KOREAN', label: '한식' },
  { value: 'WESTERN', label: '양식' },
  { value: 'CHINESE', label: '중식' },
  { value: 'JAPANESE', label: '일식' },
  { value: 'ASIAN', label: '아시안' },
  { value: 'HOME_BAKING', label: '홈 베이킹' },
  { value: 'BEVERAGE', label: '음료' },
  { value: 'SAUCE', label: '양념장' },
  { value: 'CONVENIENCE', label: '편의점' },
  { value: 'FUSION', label: '퓨전 음식' },
]

export const LISTING_STATUS_OPTIONS = [
  { value: 'ON_SALE', label: '판매 중' },
  { value: 'SOLD_OUT', label: '판매 완료' },
]

export const LISTING_TYPE_OPTIONS = [
  { value: 'SALE', label: '판매' },
  { value: 'EXCHANGE', label: '교환' },
]

const DIFFICULTY_FILTER_GROUP = {
  key: 'difficulty',
  label: '난이도',
  options: DIFFICULTY_OPTIONS,
}

const CATEGORY_FILTER_GROUP = {
  key: 'category',
  label: '카테고리',
  options: CATEGORY_OPTIONS,
}

const LISTING_TYPE_FILTER_GROUP = {
  key: 'listingType',
  label: '판매 방법',
  options: LISTING_TYPE_OPTIONS,
}

const STATUS_FILTER_GROUP = {
  key: 'status',
  label: '매진 여부',
  options: LISTING_STATUS_OPTIONS,
}

export const MARKETPLACE_FILTER_GROUPS = [
  DIFFICULTY_FILTER_GROUP,
  CATEGORY_FILTER_GROUP,
  STATUS_FILTER_GROUP,
]

export const MY_KITCHEN_FILTER_GROUPS = [
  DIFFICULTY_FILTER_GROUP,
  CATEGORY_FILTER_GROUP,
]

export const MY_SALES_FILTER_GROUPS = [
  DIFFICULTY_FILTER_GROUP,
  CATEGORY_FILTER_GROUP,
  LISTING_TYPE_FILTER_GROUP,
  STATUS_FILTER_GROUP,
]

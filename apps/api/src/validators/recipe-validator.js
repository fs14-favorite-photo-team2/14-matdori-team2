import {
  array,
  boolean,
  coerce,
  define,
  enums,
  integer,
  max,
  min,
  object,
  optional,
  size,
  string,
} from 'superstruct'

import { Category, Difficulty } from '../generated/prisma/enums.ts'

const DIFFICULTIES = Object.values(Difficulty)
const CATEGORIES = Object.values(Category)

// 필터이름, 최대 갯수 제한
const nonBlankString = (fieldName, maxLength) =>
  define(fieldName, (value) => {
    if (typeof value !== 'string') {
      return `${fieldName}은(는) 문자열이어야 합니다.`
    }

    if (value.trim().length === 0) {
      return `${fieldName}을(를) 입력해 주세요.`
    }

    if (value.length > maxLength) {
      return `${fieldName}은(는) ${maxLength}자를 넘을 수 없습니다.`
    }

    return true
  })

const ingredient = object({
  name: nonBlankString('재료 이름', 100),
  amount: nonBlankString('재료 분량', 100),
  isHighlight: boolean(),
})

const ingredientsWithStructure = size(array(ingredient), 1, Infinity)

const ingredients = define('ingredients', (value) => {
  const [structureError] = ingredientsWithStructure.validate(value)

  if (structureError) {
    return structureError.message
  }

  if (!value.some((item) => item.isHighlight === true)) {
    return '대표 재료를 최소 1개 선택해 주세요.'
  }

  return true
})

export const createRecipeRequest = object({
  body: object({
    title: nonBlankString('제목', 100),
    content: nonBlankString('레시피 내용', 20000),
    summary: nonBlankString('한 줄 설명', 1000),
    totalSupply: max(min(integer(), 1), 10),
    difficulty: enums(DIFFICULTIES),
    category: enums(CATEGORIES),
    ingredients, // 배열 전체에 대한 규칙과 각 항목의 구조를 모두 검사
  }),
  params: object({}),
  query: object({}),
})

const recipeId = coerce(min(integer(), 1), string(), (value) => Number(value))

export const getRecipeRequest = object({
  body: object({}),
  params: object({
    recipeId,
  }),
  query: object({}),
})

// 수정 요청 시 사용
export const updateRecipeRequest = object({
  body: object({
    title: optional(nonBlankString('제목', 100)),
    content: optional(nonBlankString('레시피 내용', 20000)),
    summary: optional(nonBlankString('한 줄 설명', 1000)),
    difficulty: optional(enums(DIFFICULTIES)),
    category: optional(enums(CATEGORIES)),
    ingredients: optional(ingredients),
  }),
  params: object({
    recipeId,
  }),
  query: object({}),
})

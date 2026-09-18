export const SORT_ORDERS = Object.freeze({
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc',
})

export function createdAtOrderBy(sort) {
  const direction = sort === SORT_ORDERS.OLDEST ? 'asc' : 'desc'

  return [{ createdAt: direction }, { id: direction }]
}

export const CREATED_AT_ORDER_BY = Object.freeze({
  [SORT_ORDERS.NEWEST]: createdAtOrderBy(SORT_ORDERS.NEWEST),
  [SORT_ORDERS.OLDEST]: createdAtOrderBy(SORT_ORDERS.OLDEST),
})

export const RECIPE_COPY_ORDER_BY = Object.freeze({
  ...CREATED_AT_ORDER_BY,
  [SORT_ORDERS.TITLE_ASC]: [{ recipe: { title: 'asc' } }, { id: 'asc' }],
  [SORT_ORDERS.TITLE_DESC]: [{ recipe: { title: 'desc' } }, { id: 'desc' }],
})

export const CREATED_AT_SORTS = Object.keys(CREATED_AT_ORDER_BY)
export const RECIPE_COPY_SORTS = Object.keys(RECIPE_COPY_ORDER_BY)

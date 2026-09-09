function cursorArgs(cursor, limit) {
  const take = limit + 1

  if (cursor === undefined) {
    return { take }
  }

  return { take, cursor: { id: cursor }, skip: 1 }
}

async function isStaleCursor(model, where, cursor) {
  const matches = await model.count({ where: { ...where, id: cursor } })

  return matches === 0
}

export async function findCursorPage(
  model,
  { where, select, orderBy, cursor, limit },
) {
  const rowsQuery = model.findMany({
    where,
    select,
    orderBy,
    ...cursorArgs(cursor, limit),
  })

  if (cursor === undefined) {
    return rowsQuery
  }

  const [rows, stale] = await Promise.all([
    rowsQuery,
    isStaleCursor(model, where, cursor),
  ])

  return stale ? null : rows
}

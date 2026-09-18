import api from '@/lib/api'

export async function fetchMyRecipeCopies({
  cursor,
  limit,
  keyword,
  difficulty,
  category,
  state,
  sort,
  createdByMe,
} = {}) {
  const { data } = await api.get('/users/me/recipe-copies', {
    params: {
      cursor,
      limit,
      keyword,
      difficulty,
      category,
      state,
      sort,
      createdByMe,
    },
  })

  return data
}

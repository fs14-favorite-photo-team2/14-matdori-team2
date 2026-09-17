import api from '@/lib/api'

export async function getRecipeDetail(recipeId) {
  const response = await api.get(`/recipes/${recipeId}`)

  return response.data.data
}

export async function updateRecipe(recipeId, values) {
  const {
    title,
    difficulty,
    category,
    summary,
    content,
    ingredients,
    imageFiles = [],
  } = values

  const formData = new FormData()

  formData.append('title', title)
  formData.append('difficulty', difficulty)
  formData.append('category', category)
  formData.append('summary', summary)
  formData.append('content', content)
  formData.append('ingredients', JSON.stringify(ingredients))

  imageFiles.forEach((imageFile) => {
    formData.append('images', imageFile)
  })

  const response = await api.patch(`/recipes/${recipeId}`, formData)

  return response.data.data
}

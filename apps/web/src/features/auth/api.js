import api from '@/lib/api'

export async function signup(data) {
  const response = await api.post('/auth/signup', data)

  return response.data
}

export async function login(data) {
  const response = await api.post('/auth/login', data)

  return response.data
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    if (error.response?.status === 401) return

    throw error
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/users/me')

    return response.data.data
  } catch (error) {
    if (error.response?.status === 401) {
      return null
    }

    throw error
  }
}

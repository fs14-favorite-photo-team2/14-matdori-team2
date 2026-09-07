import api from '@/lib/api'

export async function signup(data) {
  const response = await api.post('/auth/signup', data)

  return response.data
}

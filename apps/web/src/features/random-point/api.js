import api from '@/lib/api'

export async function fetchRandomPointStatus() {
  const { data } = await api.get('/random-box')
  return data.data
}

export async function claimRandomBox() {
  const { data } = await api.post('/random-box')
  return data.data
}

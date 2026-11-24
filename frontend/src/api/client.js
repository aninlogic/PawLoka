import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

export async function fetchPets(filters = {}, { signal } = {}) {
  const { age, ...params } = filters
  if (age === 'young') params.ageMax = 12
  if (age === 'adult') params.ageMin = 13
  const { data } = await api.get('/pets', { params, signal })
  return data.data
}

export async function fetchPet(id, { signal } = {}) {
  const { data } = await api.get(`/pets/${encodeURIComponent(id)}`, { signal })
  return data.data
}

export async function fetchShelters({ signal } = {}) {
  const { data } = await api.get('/shelters', { signal })
  return data.data
}

export async function fetchShelter(id, { signal } = {}) {
  const { data } = await api.get(`/shelters/${encodeURIComponent(id)}`, { signal })
  return data.data
}

export async function submitApplication(payload) {
  const { data } = await api.post('/applications', payload)
  return data.data
}

export async function fetchApplication(id, accessToken) {
  const { data } = await api.get(`/applications/${encodeURIComponent(id)}`, {
    headers: { 'X-Application-Access-Token': accessToken },
  })
  return data.data
}
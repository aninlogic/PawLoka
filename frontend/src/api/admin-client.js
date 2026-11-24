import { api } from './client'

export async function adminRequest(session, method, path, data) {
  const { data: response } = await api.request({
    method,
    url: path,
    data,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  return response?.data
}
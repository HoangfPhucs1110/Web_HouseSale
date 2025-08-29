import api from '@/lib/api'

export const signup = (payload) => api.post('/auth/signup', payload)
export const signin = (payload) => api.post('/auth/signin', payload)
export const signout = () => api.post('/auth/signout')

import axios from 'axios'

const base =
  import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()
    ? import.meta.env.VITE_API_BASE
    : '/api'

const api = axios.create({
  baseURL: base,
  withCredentials: true,
})

export default api

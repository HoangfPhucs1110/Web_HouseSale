import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,                 
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn('Unauthorized')
    }
    return Promise.reject(err)
  }
)

export default api

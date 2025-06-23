import axios from 'axios'
import { useAuth } from './auth'

const { refresh, logout } = useAuth()

const authAxios = axios.create()

authAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

authAxios.interceptors.response.use(
  res => res,
  async error => {
    const status = error.response?.status
    const originalRequest = error.config

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          originalRequest._retry = true
          await refresh()
          const newToken = localStorage.getItem('token')
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return authAxios(originalRequest)
        } catch (err) {
          logout()
          return Promise.reject(err)
        }
      } else {
        logout()
      }
    }

    return Promise.reject(error)
  }
)

export default authAxios
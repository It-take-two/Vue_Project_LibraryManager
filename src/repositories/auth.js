import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/auth'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const login = async (name, password) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/login`, { name, password })
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    console.log(localStorage.getItem("token"), "/n",localStorage.getItem('refreshToken'))
    await saveRoleName()
    return data.roleName
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

const refresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    logout()
    return
  }
  try {
    const { data } = await axios.post(`${API_BASE_URL}/refresh`, { refreshToken })
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  } catch (err) {
    console.warn('刷新 token 失败:', err)
    logout()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('roleName')
  window.dispatchEvent(new Event('app-logout'))
}

const saveRoleName = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/user/userInfo', {
      headers: getAuthHeader(),
    })
    localStorage.setItem('roleName', data.roleName)
  } catch (err) {
    console.error('获取用户信息失败:', err)
    logout()
  }
}

export const useAuth = () => ({
  login,
  refresh,
  logout,
  saveRoleName
})
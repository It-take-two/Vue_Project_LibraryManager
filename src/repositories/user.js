import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/user'

export function useUserRepository() {
  const getUserInfo = () => {
    return authAxios.get(`${BASE_URL}/userInfo`)
  }

  const getUserByUserNumber = (userNumber) => {
    return authAxios.get(`${BASE_URL}/userNumber`, { params: { userNumber } })
  }

  const getUserList = (page = 1) => {
    return authAxios.get(`${BASE_URL}/userList`, { params: { page } })
  }

  const getAdminList = (page = 1) => {
    return authAxios.get(`${BASE_URL}/adminList`, { params: { page } })
  }

  const addUser = (payload) => {
    return authAxios.post(`${BASE_URL}/add`, payload)
  }

  const updateMyUser = (phone) => {
    return authAxios.put(`${BASE_URL}/my`, null, { params: { phone } })
  }

  const updateMyPassword = (oldPassword, newPassword) => {
    return authAxios.put(`${BASE_URL}/myPassword`, null, {
      params: { oldPassword, newPassword },
    })
  }

  const resetPassword = (userId) => {
    return authAxios.put(`${BASE_URL}/resetPassword`, null, {
      params: { userId },
    })
  }

  const updateUser = (userId, payload) => {
    return authAxios.put(`${BASE_URL}/update`, payload, {
      params: { userId },
    })
  }

  const deleteUser = (id) => {
    return authAxios.delete(`${BASE_URL}/${id}`)
  }

  return {
    getUserInfo,
    getUserByUserNumber,
    getUserList,
    getAdminList,
    addUser,
    updateMyUser,
    updateMyPassword,
    resetPassword,
    updateUser,
    deleteUser,
  }
}
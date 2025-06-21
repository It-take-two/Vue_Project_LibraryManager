// src/repositories/userRepository.js
import axios from 'axios'

const BASE_URL = '/user'

export function useUserRepository() {
  const getUserInfo = () => {
    return axios.get(`${BASE_URL}/userInfo`)
  }

  const getUserList = (page = 1) => {
    return axios.get(`${BASE_URL}/userList`, { params: { page } })
  }

  const getAdminList = (page = 1) => {
    return axios.get(`${BASE_URL}/adminList`, { params: { page } })
  }

  const addUser = (payload) => {
    return axios.post(`${BASE_URL}/add`, payload)
  }

  const updateMyUser = (phone) => {
    return axios.put(`${BASE_URL}/my`, null, { params: { phone } })
  }

  const updateMyPassword = (oldPassword, newPassword) => {
    return axios.put(`${BASE_URL}/myPassword`, null, {
      params: { oldPassword, newPassword },
    })
  }

  const resetPassword = (userId) => {
    return axios.put(`${BASE_URL}/resetPassword`, null, {
      params: { userId },
    })
  }

  const updateUser = (userId, payload) => {
    return axios.put(`${BASE_URL}/update`, payload, {
      params: { userId },
    })
  }

  const deleteUser = (id) => {
    return axios.delete(`${BASE_URL}/${id}`)
  }

  return {
    getUserInfo,
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
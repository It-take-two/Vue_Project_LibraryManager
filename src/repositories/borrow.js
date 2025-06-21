import axios from 'axios'

const BASE_URL = '/borrow'

export function useBorrowRepository() {
  const getAllBorrows = (page = 1) => {
    return axios.get(`${BASE_URL}/list`, { params: { page } })
  }

  const getIncompleteBorrows = (page = 1) => {
    return axios.get(`${BASE_URL}/incomplete`, { params: { page } })
  }

  const getBorrowsByUser = (userId, page = 1) => {
    return axios.get(`${BASE_URL}/user`, { params: { userId, page } })
  }

  const getMyBorrows = (page = 1) => {
    return axios.get(`${BASE_URL}/my`, { params: { page } })
  }

  const getMyIncompleteBorrows = (page = 1) => {
    return axios.get(`${BASE_URL}/my/incomplete`, { params: { page } })
  }

  const addBorrow = (payload) => {
    // payload 应包含 userId, collectionId, returnDeadline
    return axios.post(`${BASE_URL}/add`, payload)
  }

  const updateBorrow = (borrowId, payload) => {
    // payload 包含 renewedTimes, finePaid, returnDate, collectionIsBorrowable
    return axios.put(`${BASE_URL}/update`, payload, {
      params: { borrowId },
    })
  }

  const deleteBorrow = (id) => {
    return axios.delete(`${BASE_URL}/${id}`)
  }

  const getMyOverdueBorrows = () => {
  return axios.get(`${BASE_URL}/overdue`)
}

  return {
    getAllBorrows,
    getIncompleteBorrows,
    getBorrowsByUser,
    getMyBorrows,
    getMyIncompleteBorrows,
    addBorrow,
    updateBorrow,
    deleteBorrow,
    getMyOverdueBorrows
  }
}
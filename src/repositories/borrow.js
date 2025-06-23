import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/borrow'

export function useBorrowRepository() {
  const getAllBorrows = (page = 1) => {
    return authAxios.get(`${BASE_URL}/list`, { params: { page } })
  }

  const getIncompleteBorrows = (page = 1) => {
    return authAxios.get(`${BASE_URL}/incomplete`, { params: { page } })
  }

  const getBorrowsByUser = (userId, page = 1) => {
    return authAxios.get(`${BASE_URL}/user`, { params: { userId, page } })
  }

  const getMyBorrows = (page = 1) => {
    return authAxios.get(`${BASE_URL}/my`, { params: { page } })
  }

  const getMyIncompleteBorrows = (page = 1) => {
    return authAxios.get(`${BASE_URL}/my/incomplete`, { params: { page } })
  }

  const addBorrow = (payload) => {
    // payload 应包含 userId, collectionId, returnDeadline
    return authAxios.post(`${BASE_URL}/add`, payload)
  }

  const updateBorrow = (borrowId, payload) => {
    // payload 包含 renewedTimes, finePaid, returnDate, collectionIsBorrowable
    return authAxios.put(`${BASE_URL}/update`, payload, {
      params: { borrowId },
    })
  }

  const deleteBorrow = (id) => {
    return authAxios.delete(`${BASE_URL}/${id}`)
  }

  const getMyOverdueBorrows = () => {
  return authAxios.get(`${BASE_URL}/overdue`)
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
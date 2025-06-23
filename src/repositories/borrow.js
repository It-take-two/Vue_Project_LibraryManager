import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/borrow'

export function useBorrowRepository() {
  const getBorrowByBarcode = (barcode) => {
    return authAxios.get(`${BASE_URL}/barcode`, { params: { barcode } })
  }

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

  const addBorrow = (userId, collectionId) => {
    return authAxios.post(`${BASE_URL}/add`, { userId, collectionId })
  }

  const updateBorrow = (userId, borrowId, renewedTimes, finePaid, returnDate, collectionIsBorrowable) => {
    return authAxios.put(`${BASE_URL}/update`, {
      userId,
      renewedTimes,
      finePaid,
      returnDate,
      collectionIsBorrowable,
    }, {
      params: { borrowId }
    })
  }

  const deleteBorrow = (id) => {
    return authAxios.delete(`${BASE_URL}/${id}`)
  }

  const getMyOverdueBorrows = () => {
    return authAxios.get(`${BASE_URL}/overdue`)
  }

  return {
    getBorrowByBarcode,
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
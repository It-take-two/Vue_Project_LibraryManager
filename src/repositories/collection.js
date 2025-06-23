import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/collection'

export function useCollectionRepository() {
  const searchCollections = (page = 1, keyword = '', bigCategory = '', subCategory = '') => {
    return authAxios.get(`${BASE_URL}/search`, {
      params: { page, keyword, bigCategory, subCategory },
    })
  }

  const getCollectionByBarcode = (barcode) => {
    return authAxios.get(`${BASE_URL}/barcode`, { params: { barcode } })
  }

  const getCollectionById = (id) => {
    return authAxios.get(`${BASE_URL}/id`, { params: { id } })
  }

  const getRandomBorrowableCollections = () => {
    return authAxios.get(`${BASE_URL}/random`)
  }

  const addCollection = (catalogId) => {
    return authAxios.post(`${BASE_URL}/add`, { catalogId })
  }

  const deleteCollection = (id) => {
    return authAxios.delete(`${BASE_URL}/${id}`)
  }

  return {
    searchCollections,
    getCollectionByBarcode,
    getCollectionById,
    getRandomBorrowableCollections,
    addCollection,
    deleteCollection,
  }
}
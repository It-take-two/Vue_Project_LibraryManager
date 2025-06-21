import axios from 'axios'

const BASE_URL = '/collection'

export function useCollectionRepository() {
  const searchCollections = (page = 1, keyword = '', bigCategory = '', subCategory = '') => {
    return axios.get(`${BASE_URL}/search`, {
      params: { page, keyword, bigCategory, subCategory },
    })
  }

  const getCollectionByBarcode = (barcode) => {
    return axios.get(`${BASE_URL}/barcode`, { params: { barcode } })
  }

  const getRandomBorrowableCollections = () => {
    return axios.get(`${BASE_URL}/random`)
  }

  const addCollection = (catalogId) => {
    return axios.post(`${BASE_URL}/add`, { catalogId })
  }

  const deleteCollection = (id) => {
    return axios.delete(`${BASE_URL}/${id}`)
  }

  return {
    searchCollections,
    getCollectionByBarcode,
    getRandomBorrowableCollections,
    addCollection,
    deleteCollection,
  }
}
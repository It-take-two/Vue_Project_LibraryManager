// src/repositories/catalogRepository.js
import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/catalog'

export function useCatalogRepository() {
  const getCatalogList = () => {
    return authAxios.get(`${BASE_URL}/list`)
  }

  const getCatalog = (id) => {
    return authAxios.get(`${BASE_URL}/${id}`)
  }

  const addCatalog = (payload) => {
    // payload 结构见 CatalogRequest：name, isbn, publisher, category, publishDate, author, value
    return authAxios.post(`${BASE_URL}/add`, payload)
  }

  const updateCatalog = (id, payload) => {
    return authAxios.put(`${BASE_URL}/update`, payload, {
      params: { id },
    })
  }

  const deleteCatalog = (id) => {
    return authAxios.delete(`${BASE_URL}/${id}`)
  }

  return {
    getCatalogList,
    getCatalog,
    addCatalog,
    updateCatalog,
    deleteCatalog,
  }
}
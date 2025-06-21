// src/repositories/catalogRepository.js
import axios from 'axios'

const BASE_URL = '/catalog'

export function useCatalogRepository() {
  const getCatalogList = () => {
    return axios.get(`${BASE_URL}/list`)
  }

  const getCatalog = (id) => {
    return axios.get(`${BASE_URL}/${id}`)
  }

  const addCatalog = (payload) => {
    // payload 结构见 CatalogRequest：name, isbn, publisher, category, publishDate, author, value
    return axios.post(`${BASE_URL}/add`, payload)
  }

  const updateCatalog = (id, payload) => {
    return axios.put(`${BASE_URL}/update`, payload, {
      params: { id },
    })
  }

  const deleteCatalog = (id) => {
    return axios.delete(`${BASE_URL}/${id}`)
  }

  return {
    getCatalogList,
    getCatalog,
    addCatalog,
    updateCatalog,
    deleteCatalog,
  }
}
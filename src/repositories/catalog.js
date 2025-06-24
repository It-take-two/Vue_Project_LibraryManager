import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/catalog'

export function useCatalogRepository() {
  const getCatalogList = (page) => {
    return authAxios.get(`${BASE_URL}/list`, { params: { page } })
  }

  const getCatalog = (id) => {
    return authAxios.get(`${BASE_URL}/${id}`)
  }

  const addCatalog = (payload) => {
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

  const getCatalogByIsbn = (isbn) => {
    return authAxios.get(`${BASE_URL}/isbn`, { params: { isbn } })
  }

  return {
    getCatalogList,
    getCatalog,
    addCatalog,
    updateCatalog,
    deleteCatalog,
    getCatalogByIsbn,
  }
}

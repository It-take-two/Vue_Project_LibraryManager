import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/class'

export function useClassRepository() {
  const getClassById = (id) => {
    return authAxios.get(`${BASE_URL}/${id}`)
  }

  return {
    getClassById,
  }
}
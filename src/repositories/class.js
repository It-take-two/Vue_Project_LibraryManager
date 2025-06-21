import axios from 'axios'

const BASE_URL = '/class'

export function useClassRepository() {
  const getClassById = (id) => {
    return axios.get(`${BASE_URL}/${id}`)
  }

  return {
    getClassById,
  }
}
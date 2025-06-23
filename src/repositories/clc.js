// src/repositories/clcRepository.js
import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/clc'

export function useClcRepository() {
  const getClcTree = () => {
    return authAxios.get(`${BASE_URL}/tree`)
  }

  const getClcById = (id) => {
    return authAxios.get(`${BASE_URL}/${id}`)
  }

  return {
    getClcTree,
    getClcById,
  }
}
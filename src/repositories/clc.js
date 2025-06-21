// src/repositories/clcRepository.js
import axios from 'axios'

const BASE_URL = '/clc'

export function useClcRepository() {
  const getClcTree = () => {
    return axios.get(`${BASE_URL}/tree`)
  }

  const getClcById = (id) => {
    return axios.get(`${BASE_URL}/${id}`)
  }

  return {
    getClcTree,
    getClcById,
  }
}
// src/repositories/reportRepository.js
import axios from 'axios'

const BASE_URL = '/report'

export function useReportRepository() {
  const getReportList = () => {
    return axios.get(`${BASE_URL}/list`)
  }

  const exportReport = () => {
    return axios.get(`${BASE_URL}/export`, {
      responseType: 'blob',
    })
  }

  return {
    getReportList,
    exportReport,
  }
}
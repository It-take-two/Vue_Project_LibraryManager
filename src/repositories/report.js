import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/report'

export function useReportRepository() {
  const getReportList = () => {
    return authAxios.get(`${BASE_URL}/list`)
  }

  const exportReport = () => {
    return authAxios.get(`${BASE_URL}/export`, {
      responseType: 'blob',
    })
  }

  return {
    getReportList,
    exportReport,
  }
}
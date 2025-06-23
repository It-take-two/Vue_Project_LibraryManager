import authAxios from './interceptors'

const BASE_URL = 'http://localhost:8080/borrowRule'

export function useBorrowRuleRepository() {
  const getBorrowRules = () => {
    return authAxios.get(`${BASE_URL}/list`)
  }

  return {
    getBorrowRules,
  }
}
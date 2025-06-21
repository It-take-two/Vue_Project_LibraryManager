import axios from 'axios'

const BASE_URL = '/borrowRule'

export function useBorrowRuleRepository() {
  const getBorrowRules = () => {
    return axios.get(`${BASE_URL}/list`)
  }

  return {
    getBorrowRules,
  }
}
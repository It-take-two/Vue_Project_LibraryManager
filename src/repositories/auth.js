import { reactive } from "vue";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/auth"; 

export const auth = () => {
  const state = reactive({
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    user: null,
  });

  const saveTokens = (token, refreshToken) => {
    state.token = token;
    state.refreshToken = refreshToken;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const register = async (name, password) => {
    await axios.post(`${API_BASE_URL}/register`, { name, password });
  };

  const login = async (name, password) => {
    const response = await axios.post(`${API_BASE_URL}/login`, { name, password });
    saveTokens(response.data.token, response.data.refreshToken);
    state.user = response.data.user;
  };

  const refresh = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/refresh`, { refreshToken: state.refreshToken });
      saveTokens(response.data.token, state.refreshToken);
    } catch (error) {
      console.error("刷新令牌失败，需要重新登录");
      logout();
    }
  };

  const logout = () => {
    state.token = null;
    state.refreshToken = null;
    state.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return { state, register, login, refresh, logout };
};

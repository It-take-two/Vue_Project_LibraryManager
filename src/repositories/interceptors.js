import axios from "axios";
import { auth } from "/auth";

const { state, refresh, logout } = auth();

axios.interceptors.request.use(config => {
    if (state.token) {
        config.headers.Authorization = 'Bearer ${state.token}';
        return config;
    }
});

axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401 && state.refreshToken) {
            try {
                await refresh();
                error.config.headers.Authorization = 'Bearer ${state.token}';
                return axios(error.config);
            } catch {
                console.error("自动刷新 Token 失败，需要重新登录");
                logout();
            }
        }
        return Promise.reject(error);
    }
);
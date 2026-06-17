import axios from 'axios';

const api = axios.create({
    baseURL: 'https://erp-company-system.runasp.net/api',
});

// بيضيف الـ Token تلقائياً في كل Request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// لو الـ Token انتهى → يرجع للـ Login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
import axios from 'axios';

// Lấy baseURL từ biến môi trường, mặc định là URL production
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://reviewapp-be.onrender.com';

const api = axios.create({
    baseURL,
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm Bearer Token vào mỗi yêu cầu
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
import axios from 'axios';

// Lấy baseURL từ biến môi trường, mặc định là localhost:8000 nếu không có
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://reviewapp-be.onrender.com';

const api = axios.create({
    baseURL,
    withCredentials: true, // Gửi cookie lên server
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
    },
});

export default api;

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://reviewapp-be.onrender.com';

const api = axios.create({
    baseURL,
    withCredentials: true, // Gửi cookie tự động
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
    },
});

export default api;
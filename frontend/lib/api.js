import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 60000, // 60 seconds
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userInfo') 
            ? JSON.parse(localStorage.getItem('userInfo')).token 
            : null;
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

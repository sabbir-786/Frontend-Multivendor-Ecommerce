import axios from 'axios';

const api = axios.create({
    baseURL: 'https://multivendorecommerce-production-000c.up.railway.app', // Your backend URL
});

// --- REQUEST INTERCEPTOR (You already have this, it's perfect) ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR (The Pro-Tier Upgrade) ---
api.interceptors.response.use(
    (response) => {
        // If the request succeeds, just return the response normally
        return response;
    },
    (error) => {
        // If the server sends an error, check if it's a 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid. Logging out...");

            // 1. Clear the bad data from storage
            localStorage.removeItem('jwt');
            localStorage.removeItem('role');
            localStorage.removeItem('user');

            // 2. Force the browser back to the login page
            window.location.href = '/login';
        }

        // Return the error so your Redux thunks can still catch it
        return Promise.reject(error);
    }
);

export default api;

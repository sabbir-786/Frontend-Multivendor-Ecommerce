import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5454',
    headers: {
        'Content-Type': 'application/json',
    }
});

// --- REQUEST INTERCEPTOR ---
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

// --- RESPONSE INTERCEPTOR (Smart 401 Handling) ---
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const errorMessage = error.response?.data?.message || '';

            // Match exact backend error messages
            const isAccountStatusError =
                errorMessage.includes('pending admin approval') ||
                errorMessage.includes('suspended or banned') ||
                errorMessage.includes('Account Status:') ||
                errorMessage.includes('pending') ||
                errorMessage.includes('approval') ||
                errorMessage.includes('suspended') ||
                errorMessage.includes('banned') ||
                errorMessage.includes('deactivated');

            if (isAccountStatusError) {
                // Let the error bubble up so Login.jsx can show the Error Box UI
                return Promise.reject(error);
            }

            // Only auto-logout for TRUE authentication failures (expired JWTs)
            localStorage.removeItem('jwt');
            localStorage.removeItem('role');
            localStorage.removeItem('user');

            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;

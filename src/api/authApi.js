import api from './axios';

// The "Operator" that handles all auth-related requests
export const authApi = {
    sendOtp: (payload) => api.post('/auth/sent/login-signup-otp', payload),
    verifyOtp: (payload) => api.post('/auth/signin', payload),
    registerSeller: (payload) => api.post('/auth/signup', payload),
    getUserProfile: () => api.get('/api/users/profile'),
    updateUserProfile: (payload) => api.patch('/api/users/profile', payload),
};

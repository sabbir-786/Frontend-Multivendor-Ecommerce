import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// --- The "Operator" ---
export const authapi = {
    sendOtp: (payload) => api.post('/auth/sent/login-signup-otp', payload),
    verifyOtp: (payload) => api.post('/auth/signin', payload),
    registerSeller: (payload) => api.post('/auth/signup', payload),
    getUserProfile: () => api.get('/api/users/profile'),
    updateUserProfile: (payload) => api.patch('/api/users/profile', payload),
};

// --- Async Thunks ---

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authapi.sendOtp(payload);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP.';
            return rejectWithValue(message);
        }
    }
);

// Fetch Full User Profile
export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authapi.getUserProfile();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile.');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            // 1. Verify OTP and get the JWT
            const response = await authapi.verifyOtp(payload);
            const { jwt, role } = response.data;

            // 2. Temporarily set token in localStorage so the next request works
            localStorage.setItem('jwt', jwt);

            // 3. Immediately fetch the full user profile from the database
            const profileAction = await dispatch(getUserProfile());
            const userProfile = profileAction.payload;

            return {
                jwt,
                role,
                user: userProfile // Now we have the REAL fullName and details!
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid or Expired OTP';
            return rejectWithValue(errorMessage);
        }
    }
);

export const registerSeller = createAsyncThunk(
    'auth/registerSeller',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authapi.registerSeller(payload);
            // We just return the success message, intentionally throwing away the JWT
            // so the user is forced to route to /login
            return response.data.message || "Registration successful. Please log in.";
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed.';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authapi.updateUserProfile(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Update failed.');
        }
    }
);

// --- Initial State ---
const storedToken = localStorage.getItem("jwt");
const storedRole = localStorage.getItem("role");
const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

const initialState = {
    user: storedUser,
    token: storedToken || null,
    role: storedRole || null,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
};

// --- Slice ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("jwt");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendOtp.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                localStorage.setItem("user", JSON.stringify(action.payload));
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem("user", JSON.stringify(state.user));
            })
            .addCase(registerSeller.fulfilled, (state) => {
                state.isLoading = false;
                // Intentional: User stays logged out
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            )
            .addMatcher(
                (action) => [verifyOtp.fulfilled.type].includes(action.type),
                (state, action) => {
                    state.isLoading = false;
                    state.isAuthenticated = true;
                    state.token = action.payload.jwt;
                    state.role = action.payload.role;
                    state.user = action.payload.user;

                    localStorage.setItem("jwt", action.payload.jwt);
                    localStorage.setItem("role", action.payload.role);
                    localStorage.setItem("user", JSON.stringify(action.payload.user));
                }
            );
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

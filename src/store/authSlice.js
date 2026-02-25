import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// --- API Operators ---
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
            const message = error.response?.data?.message || error.message || 'Failed to send OTP.';
            return rejectWithValue(message);
        }
    }
);

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
            const userProfile = await dispatch(getUserProfile()).unwrap();

            return {
                jwt,
                role,
                user: userProfile
            };
        } catch (error) {
            // Clean up the invalid token if the process fails mid-way
            localStorage.removeItem('jwt');

            if (typeof error === 'string') {
                return rejectWithValue(error);
            }

            if (error?.message && typeof error.message === 'string') {
                return rejectWithValue(error.message);
            }

            if (error?.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }

            return rejectWithValue('Invalid or Expired OTP');
        }
    }
);

export const registerSeller = createAsyncThunk(
    'auth/registerSeller',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authapi.registerSeller(payload);
            return response.data?.message || "Registration successful. Please wait for approval.";
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

// --- Safe LocalStorage Parsing ---
const safeJSONParse = (data) => {
    try {
        return data && data !== "undefined" ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

// --- Initial State ---
const storedToken = localStorage.getItem("jwt");
const storedRole = localStorage.getItem("role");
const storedUser = safeJSONParse(localStorage.getItem("user"));

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
            // Fulfilled States
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
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.token = action.payload.jwt;
                state.role = action.payload.role;
                state.user = action.payload.user;

                localStorage.setItem("jwt", action.payload.jwt);
                localStorage.setItem("role", action.payload.role);
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            })

            // Global Pending Matcher
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                    state.error = null;
                }
            )

            // Global Rejected Matcher
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authapi';

// --- Async Thunks ---

// 1. Send OTP
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authApi.sendOtp(payload);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data || 'Failed to send OTP.';
            return rejectWithValue(typeof message === 'string' ? message : 'Failed to send OTP.');
        }
    }
);

// 2. Verify OTP & Login
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authApi.verifyOtp(payload);
            const user = payload.email ? { email: payload.email } : { mobile: payload.mobile };
            return {
                jwt: response.data.jwt,
                role: response.data.role,
                user: { ...user, fullName: response.data.fullName || user.email }
            };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                'Invalid or Expired OTP';

            return rejectWithValue(errorMessage);
        }
    }
);

// 3. Register Seller
export const registerSeller = createAsyncThunk(
    'auth/registerSeller',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authApi.registerSeller(payload);

            return {
                jwt: response.data.jwt,
                role: response.data.role,
                user: {
                    email: payload.email,
                    fullName: payload.fullName,
                    mobile: payload.mobile
                }
            };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                'Registration failed.';

            return rejectWithValue(errorMessage);
        }
    }
);

// 4. Update User Profile
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await authApi.updateUserProfile(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Update failed.');
        }
    }
);

// 5. Fetch Full User Profile
export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            // FIXED: Removed the undefined 'payload' variable here
            const response = await authApi.getUserProfile();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile.');
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

            // --- THE FIX: Handle Registration Separately ---
            .addCase(registerSeller.fulfilled, (state) => {
                state.isLoading = false;
                // We intentionally DO NOT set isAuthenticated or save the token here.
                // This ensures the user stays logged out and the GuestGuard lets them route to /login.
            })
            // -----------------------------------------------

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

            // --- LOGIN ONLY MATCHER ---
            // Removed registerSeller.fulfilled.type from this array
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

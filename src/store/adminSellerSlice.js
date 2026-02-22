import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios'; // Make sure this path matches your Axios instance file

// --- 1. Async Thunk: Fetch Sellers ---
// You can pass a status (e.g., 'PENDING_VERIFICATION') to filter the list
export const fetchSellers = createAsyncThunk(
    'adminSeller/fetchSellers',
    async (status, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/admin/sellers', {
                params: status ? { status } : {}
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch sellers"
            );
        }
    }
);

// --- 2. Async Thunk: Update Seller Status ---
export const updateSellerStatus = createAsyncThunk(
    'adminSeller/updateSellerStatus',
    async ({ sellerId, status }, { rejectWithValue }) => {
        try {
            // Spring Boot expects the ENUM as a raw JSON string (e.g., "ACTIVE")
            const response = await api.patch(`/api/admin/sellers/${sellerId}/status`, `"${status}"`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data; // Returns the updated Seller object
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update seller status"
            );
        }
    }
);

// --- 3. Redux Slice ---
const adminSellerSlice = createSlice({
    name: 'adminSeller',
    initialState: {
        sellers: [],
        loading: false,
        error: null,
        updateLoading: false,
        updateError: null,
    },
    reducers: {
        clearSellerErrors: (state) => {
            state.error = null;
            state.updateError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Sellers Cases ---
            .addCase(fetchSellers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSellers.fulfilled, (state, action) => {
                state.loading = false;
                state.sellers = action.payload;
            })
            .addCase(fetchSellers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Update Seller Status Cases ---
            .addCase(updateSellerStatus.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateSellerStatus.fulfilled, (state, action) => {
                state.updateLoading = false;

                // 💡 UX IMPROVEMENT:
                // Instantly remove the approved/rejected seller from the pending list
                const updatedSeller = action.payload;
                state.sellers = state.sellers.filter(seller => seller.id !== updatedSeller.id);
            })
            .addCase(updateSellerStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });
    }
});

export const { clearSellerErrors } = adminSellerSlice.actions;
export default adminSellerSlice.reducer;

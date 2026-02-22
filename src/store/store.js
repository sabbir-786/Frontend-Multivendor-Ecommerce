import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // We will create this next
import adminSellerReducer from './adminSellerSlice'; // We will create this next

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminSeller: adminSellerReducer,
  },
});

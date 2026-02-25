import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { logout, getUserProfile } from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  // Session Restoration Logic
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('jwt');

      if (token) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (error) {
          console.error("Session check error:", error);

          // ✅ FIX: Check if it's an account status error (pending/suspended/banned)
          const errorMessage = typeof error === 'string' ? error : error?.message || '';
          const lowerError = errorMessage.toLowerCase();

          const isAccountStatusError =
            lowerError.includes('pending') ||
            lowerError.includes('approval') ||
            lowerError.includes('suspended') ||
            lowerError.includes('banned') ||
            lowerError.includes('deactivated');

          // ✅ Only logout for TRUE session expiry, not account status issues
          if (!isAccountStatusError) {
            console.error("Session expired or invalid - logging out");
            dispatch(logout());
          } else {
            console.warn("Account has status issue - keeping token for error display");
            // Don't logout - let the login page show the error box
          }
        }
      }
    };

    checkUserSession();
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        expand={false}
      />

      <AppRoutes />
    </>
  );
}

export default App;

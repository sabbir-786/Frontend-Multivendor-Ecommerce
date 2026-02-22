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
          console.error("Session expired or invalid:", error);
          dispatch(logout());
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

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants/roles'; // <-- 1. Import your constants

const GuestGuard = () => {
    // Destructure 'role' directly from the auth state
    const { isAuthenticated, user, role } = useSelector((state) => state.auth);

    if (isAuthenticated && user) {
        // 2. Use the constants instead of hardcoded strings
        if (role === USER_ROLES.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (role === USER_ROLES.SELLER) {
            return <Navigate to="/seller/dashboard" replace />;
        }
        if (role === USER_ROLES.CUSTOMER) {
            return <Navigate to="/account" replace />;
        }
    }

    return <Outlet />;
};

export default GuestGuard;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants/roles';

const GuestGuard = () => {
    const { isAuthenticated, user, role } = useSelector((state) => state.auth);

    if (isAuthenticated && user) {
        if (role === USER_ROLES.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (role === USER_ROLES.SELLER) {
            return <Navigate to="/seller/dashboard" replace />;
        }
        if (role === USER_ROLES.CUSTOMER) {
            // FIXED: Redirects to home page instead of /account
            return <Navigate to="/" replace />;
        }
    }

    // Unauthenticated users will hit this and be allowed to see the signup/login pages
    return <Outlet />;
};

export default GuestGuard;

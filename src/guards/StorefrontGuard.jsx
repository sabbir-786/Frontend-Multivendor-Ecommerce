import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants/roles';

const StorefrontGuard = () => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    // If logged in as Admin or Seller, ban them from the customer home page
    if (isAuthenticated) {
        if (role === USER_ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
        if (role === USER_ROLES.SELLER) return <Navigate to="/seller/dashboard" replace />;
    }

    // Customers and non-logged-in Guests are allowed through
    return <Outlet />;
};

export default StorefrontGuard;

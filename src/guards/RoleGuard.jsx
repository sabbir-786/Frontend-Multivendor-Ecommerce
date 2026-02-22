import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants/roles';


const RoleGuard = ({ allowedRoles }) => {
    const { isAuthenticated, user, role } = useSelector((state) => state.auth);
    const location = useLocation();

    // 1. If not logged in, send to login and remember where they tried to go
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. If logged in but WRONG role, send them to their proper home
    if (allowedRoles && !allowedRoles.includes(role)) {

        // Use the constants instead of typing the strings!
        if (role === USER_ROLES.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (role === USER_ROLES.SELLER) {
            return <Navigate to="/seller/dashboard" replace />;
        }

        // Fallback for Customers (or anyone else)
        return <Navigate to="/" replace />;
    }

    // 3. If logged in AND has the right role, let them through
    return <Outlet />;
};

export default RoleGuard;

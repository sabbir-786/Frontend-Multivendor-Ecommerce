import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Constants
import { USER_ROLES } from '../constants/roles';

// Guards & Layouts
import RoleGuard from '../guards/RoleGuard';
import GuestGuard from '../guards/GuestGuard';
import DashboardLayout from '../layouts/DashboardLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../auth/Login';
import SellerSignup from '../pages/seller/SellerSignup';

// Public Pages
import Home from '../pages/customer/Home';

// Protected Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SellerApprovalTable from '../components/admin/SellerApprovalTable';
import AccountProfile from '../pages/customer/AccountProfile';

const AppRoutes = () => {
    return (
        <Routes>

            {/* --- PUBLIC ROUTES (Visible to everyone, logged in or not) --- */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
            </Route>

            {/* --- GUEST ROUTES (Only for users who are NOT logged in) --- */}
            <Route element={<GuestGuard />}>
                <Route path="/login" element={<Login />} />
                {/* Fixed the path to use a slash so it matches your URL */}
                <Route path="/seller/signup" element={<SellerSignup />} />
            </Route>

            {/* --- CUSTOMER PROTECTED ROUTES --- */}
            <Route element={<RoleGuard allowedRoles={[USER_ROLES.CUSTOMER]} />}>
                <Route element={<MainLayout />}>
                    <Route path='/account' element={<AccountProfile />} />
                </Route>
            </Route>

            {/* --- SELLER ROUTES (Protected) --- */}
            <Route element={<RoleGuard allowedRoles={[USER_ROLES.SELLER]} />}>
                <Route element={<DashboardLayout role="seller" />}>
                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                </Route>
            </Route>

            {/* --- ADMIN ROUTES (Protected) --- */}
            <Route element={<RoleGuard allowedRoles={[USER_ROLES.ADMIN]} />}>
                <Route element={<DashboardLayout role="admin" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/sellers" element={<SellerApprovalTable />} />
                </Route>
            </Route>

            {/* --- FALLBACK ROUTE --- */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
};

export default AppRoutes;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Constants
import { USER_ROLES } from '../constants/roles';

// Guards & Layouts
import RoleGuard from '../guards/RoleGuard';
import GuestGuard from '../guards/GuestGuard';
import StorefrontGuard from '../guards/StorefrontGuard'; // <-- Make sure you created this file!
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

            {/* --- PUBLIC / STOREFRONT ROUTES --- */}
            {/* StorefrontGuard allows Customers and Guests, but kicks Admins/Sellers to their dashboards */}
            <Route element={<StorefrontGuard />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Route>

            {/* --- GUEST ROUTES (Only for users who are NOT logged in) --- */}
            <Route element={<GuestGuard />}>
                <Route path="/login" element={<Login />} />
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
            {/* If a route is not found, send them home (guards will handle routing from there) */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
};

export default AppRoutes;

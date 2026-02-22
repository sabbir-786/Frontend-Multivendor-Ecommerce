import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar.';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Get user info from Redux
    const { user, role } = useSelector((state) => state.auth);

    // ✅ Fallbacks for user info
    const userName = user?.fullName || user?.name || 'User';
    const displayRole = role ? role.replace('ROLE_', '').toLowerCase() : '';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans selection:bg-black selection:text-white">



            {/* 1. Sidebar (Left) */}
            <Sidebar
                role={role}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* 2. Main Content Wrapper (Right) */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="flex justify-between items-center py-4 px-6 md:px-10 bg-white border-b border-gray-100 z-10">

                    {/* Left: Mobile Menu Button & Title */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-500 hover:text-black transition-colors focus:outline-none"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" strokeWidth={1.5} />
                        </button>

                        <h2 className="hidden md:block text-lg font-serif text-gray-900 capitalize tracking-wide">
                            {displayRole} Dashboard
                        </h2>
                    </div>

                    {/* Right: Icons & Profile */}
                    <div className="flex items-center space-x-6">

                        {/* Notifications */}
                        <button className="relative text-gray-400 hover:text-black transition-colors focus:outline-none">
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            <Bell className="h-5 w-5" strokeWidth={1.5} />
                        </button>

                        {/* Vertical Divider */}
                        <div className="h-6 w-px bg-gray-200 hidden md:block" />

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900 leading-none mb-1">
                                    {userName}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">
                                    {displayRole}
                                </span>
                            </div>

                            {/* DiceBear Anime Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                                <img
                                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${userName}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full bg-white"
                                />
                            </div>
                        </div>

                    </div>
                </header>

                {/* Page Content (Scrollable) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-6 md:p-10 scrollbar-thin scrollbar-thumb-gray-200">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* The specific page (like SellerApprovalTable) renders here */}
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

            </div>
        </div>
    );
};

export default DashboardLayout;

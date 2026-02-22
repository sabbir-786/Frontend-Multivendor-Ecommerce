import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    ListOrdered,
    DollarSign,
    Settings,
    LogOut,
    Package
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Sidebar = ({ role, isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 1. Define Menus for each Role
    const adminMenu = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/admin/sellers', icon: Users, label: 'Sellers' },
        { path: '/admin/products', icon: Package, label: 'Catalog' },
        { path: '/admin/orders', icon: ListOrdered, label: 'Orders' },
        { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
    ];

    const sellerMenu = [
        { path: '/seller/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/seller/products', icon: Package, label: 'My Catalog' },
        { path: '/seller/orders', icon: ListOrdered, label: 'My Orders' },
        { path: '/seller/payments', icon: DollarSign, label: 'Payments' },
        { path: '/seller/settings', icon: Settings, label: 'Settings' },
    ];

    // 2. Safely check the role (accounting for Spring Boot's 'ROLE_' prefix)
    const isAdmin = role === 'ROLE_ADMIN' || role === 'admin';
    const menuItems = isAdmin ? adminMenu : sellerMenu;

    // Handle Logout safely
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay (Matches Modal Backdrop) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out font-sans selection:bg-black selection:text-white
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:inset-0
            `}>

                {/* Logo Area */}
                <div className="flex items-center justify-center h-[72px] border-b border-gray-100 shrink-0">
                    <h1 className="text-xl md:text-2xl font-serif tracking-widest text-gray-900 uppercase">
                        {isAdmin ? 'Admin' : 'Partner'}
                    </h1>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={`
                                    group flex items-center px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all
                                    ${isActive
                                        ? 'bg-black text-white'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-black'}
                                `}
                            >
                                <Icon className="mr-4 h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button (Bottom) */}
                <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50/30">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:bg-black hover:text-white transition-all group"
                    >
                        <LogOut className="mr-4 h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

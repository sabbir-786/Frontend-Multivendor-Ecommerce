import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, LogOut, Settings, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/authSlice'; // Ensure this path is correct

// Import Modals
import CartWrapper from '../../pages/customer/modals/CartWrapper.jsx';
import SearchWrapper from '../../pages/customer/modals/SearchWrapper.jsx';

const FASHION_LINKS = ['New Arrivals', 'Women', 'Men', 'Winter Edit', 'Accessories', 'Sale'];

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        setIsUserDropdownOpen(false);
        navigate('/');
    };

    const NavItem = ({ label, isMobile = false }) => (
        <a href="#" className={`text-white hover:text-gray-300 transition-colors text-[11px] font-bold uppercase tracking-[0.15em] ${isMobile ? "text-lg py-3 border-b border-white/10 w-full block font-serif capitalize tracking-normal" : "relative group"}`}>
            {label}
            {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>}
        </a>
    );

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-5 ${isScrolled ? 'bg-black shadow-lg py-4' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
                <div className="flex items-center justify-between">
                    {/* Left: Mobile Menu & Search */}
                    <div className="flex items-center gap-6 flex-1">
                        <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setIsSearchOpen(true)} className="hidden lg:block text-white/80 hover:text-white transition-colors">
                            <Search size={18} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Center: Brand Logo */}
                    <div className="flex-0 text-center">
                        <Link to="/" className="text-white text-3xl md:text-4xl font-serif tracking-widest font-normal hover:opacity-90 transition-opacity">𝖭𝖤𝖷𝖳𝖪𝖠𝖱𝖳</Link>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex items-center justify-end gap-5 flex-1 text-white">


                        {/* --- USER ICON & DROPDOWN --- */}
                        <div className="relative" ref={dropdownRef}>
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="w-7 h-7 rounded-full bg-white/10 overflow-hidden border border-transparent hover:border-gray-300 transition-all flex items-center justify-center p-0.5"
                                >
                                    <img
                                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.name || user?.email || 'anime'}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full bg-gray-100"
                                    />
                                </button>
                            ) : (
                                <Link to="/login" className="hover:text-gray-300 transition-colors">
                                    <User size={20} strokeWidth={1.5} />
                                </Link>
                            )}

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isUserDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-4 w-52 bg-white border border-gray-100 shadow-xl py-2 z-[60]"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Account</p>
                                            <p className="text-xs font-medium text-black truncate">{user?.name || user?.email}</p>
                                        </div>

                                        <Link to="/account" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                            <UserCircle size={14} strokeWidth={2} /> Profile
                                        </Link>

                                        <Link to="/account/orders" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                            <ShoppingBag size={14} strokeWidth={2} /> My Orders
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors mt-1"
                                        >
                                            <LogOut size={14} strokeWidth={2} /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button className="hidden md:block hover:text-gray-300 transition-colors">
                            <Heart size={20} strokeWidth={1.5} />
                        </button>

                        <button onClick={() => setIsCartOpen(true)} className="relative hover:text-gray-300 transition-colors">
                            <ShoppingBag size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex justify-center items-center gap-10 mt-6">
                    {FASHION_LINKS.map((item) => <NavItem key={item} label={item} />)}
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-0 bg-neutral-900 z-50 flex flex-col p-6 lg:hidden">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                <span className="text-white text-2xl font-serif tracking-widest">BRAND</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={24} strokeWidth={1.5} /></button>
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto h-full">
                                {FASHION_LINKS.map((item) => <NavItem key={item} label={item} isMobile />)}
                                <div className="my-4 border-t border-white/10" />
                                <Link to={isAuthenticated ? "/account" : "/login"} className="text-white hover:text-gray-200 text-lg py-3 border-b border-white/10 w-full flex items-center gap-4 font-serif capitalize" onClick={() => setIsMobileMenuOpen(false)}>
                                    {isAuthenticated ? (
                                        <>
                                            <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.name || user?.email || 'anime'}`} alt="Profile" className="w-8 h-8 rounded-full bg-gray-100" />
                                            <span>Hi, {user?.name || 'Customer'}</span>
                                        </>
                                    ) : 'Sign In / Register'}
                                </Link>
                                {isAuthenticated && (
                                    <button onClick={handleLogout} className="text-red-400 text-left text-lg py-3 flex items-center gap-4 font-serif capitalize">
                                        <LogOut size={20} /> Logout
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <CartWrapper isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <SearchWrapper isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;

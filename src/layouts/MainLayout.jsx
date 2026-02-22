import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const location = useLocation();


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white relative bg-white">

            {/* 1. Fixed Header */}
            <Header />

            {/* 2. Main Content Area */}
            {/* Added overflow-x-hidden to prevent horizontal scrolling during page transitions */}
            <main className="flex-grow flex flex-col w-full overflow-x-hidden">

                {/* --- PAGE TRANSITIONS --- */}
                {/* mode="wait" ensures the old page fades out BEFORE the new one fades in */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex-grow flex flex-col"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* 3. Footer */}
            <Footer />
        </div>
    );
};

export default MainLayout;

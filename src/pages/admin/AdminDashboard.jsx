import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellers } from '../../store/adminSellerSlice';
import {
    TrendingUp,
    Users,
    AlertCircle,
    Package,
    ArrowRight,
    Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const dispatch = useDispatch();

    // Grab the pending sellers from Redux to show a live notification badge
    const { sellers, loading } = useSelector((state) => state.adminSeller);

    useEffect(() => {
        // Fetch pending sellers to update the dashboard counter
        dispatch(fetchSellers('PENDING_VERIFICATION'));
    }, [dispatch]);

    // Monochrome stats setup
    const stats = [
        { title: 'Total Revenue', value: '$45,231.89', icon: TrendingUp },
        { title: 'Active Sellers', value: '124', icon: Users },
        { title: 'Total Products', value: '1,893', icon: Package },
        {
            title: 'Pending Approvals',
            value: loading ? '...' : (sellers?.length || 0),
            icon: AlertCircle,
            alert: true // Flag to give this specific stat a subtle emphasis
        },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto">

            {/* --- HEADER --- */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2 block">
                    Platform Management
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">Admin Overview</h1>
                <p className="text-sm font-light text-gray-500">
                    Live platform metrics and pending action items.
                </p>
                <div className="w-12 h-px bg-black mt-6" />
            </motion.div>

            {/* --- STATS GRID --- */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                {stats.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`bg-white border p-6 flex flex-col justify-between group transition-colors duration-300 ${item.alert && item.value > 0 ? 'border-red-200 bg-red-50/10 hover:border-red-300' : 'border-gray-200 hover:border-black'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-black transition-colors">
                                    {item.title}
                                </h3>
                                <Icon className={`h-4 w-4 ${item.alert && item.value > 0 ? 'text-red-400' : 'text-gray-300 group-hover:text-black'} transition-colors`} strokeWidth={1.5} />
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-serif text-gray-900 leading-none">
                                    {item.value}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* --- QUICK ACTIONS & STATUS --- */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Pending Sellers Card (Spans 2 columns) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white border border-gray-200 p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                Action Required
                            </h3>
                        </div>
                        <h4 className="text-2xl font-serif text-gray-900 mb-2">Seller Approvals Pending</h4>
                        <p className="text-sm font-light text-gray-500 max-w-md leading-relaxed">
                            You have <strong className="font-semibold text-black">{sellers?.length || 0}</strong> seller applications waiting for review. Processing these applications quickly expands your platform's catalog.
                        </p>
                    </div>

                    <div className="mt-8 relative z-10">
                        <Link
                            to="/admin/sellers"
                            className="inline-flex items-center gap-3 bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all w-fit"
                        >
                            Review Applications <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Decorative subtle background icon */}
                    <AlertCircle className="absolute -bottom-10 -right-10 w-48 h-48 text-gray-50/50 group-hover:scale-105 transition-transform duration-700 pointer-events-none" strokeWidth={0.5} />
                </motion.div>

                {/* System Status Mock */}
                <motion.div variants={itemVariants} className="bg-white border border-gray-200 p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                            System Status
                        </h3>
                    </div>

                    <ul className="space-y-6 flex-1">
                        {[
                            { label: 'Database Core', status: 'Operational' },
                            { label: 'Payment Gateway', status: 'Operational' },
                            { label: 'Email / OTP Service', status: 'Operational' },
                        ].map((service, idx) => (
                            <li key={idx} className="flex items-center justify-between pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                <span className="text-sm font-light text-gray-600">{service.label}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                                        {service.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </motion.div>

        </div>
    );
};

export default AdminDashboard;

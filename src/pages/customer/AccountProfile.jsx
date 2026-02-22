import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Smartphone, Camera, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Imported the new thunk from your auth slice
import { updateUserProfile } from '../../store/authSlice';

const AccountProfile = () => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Local state for form fields
    const [formData, setFormData] = useState({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            // ✅ Dispatched the thunk and used unwrap() to handle the Promise result
            await dispatch(updateUserProfile(formData)).unwrap();

            toast.success("Profile Updated", {
                description: "Your changes have been saved successfully."
            });
        } catch (error) {
            toast.error("Update Failed", {
                description: error || "Something went wrong. Please try again."
            });
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">

                {/* --- HEADER --- */}
                <header className="mb-12 border-b border-gray-100 pb-8">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2 block">Settings</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900">My Account</h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-16">

                    {/* --- SIDE NAVIGATION --- */}
                    <aside className="w-full lg:w-64 space-y-6">
                        <nav className="flex flex-col gap-1">
                            {['Profile', 'Orders', 'Addresses', 'Wishlist', 'Security'].map((item) => (
                                <button
                                    key={item}
                                    className={`text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${item === 'Profile' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* --- MAIN CONTENT: PROFILE FORM --- */}
                    <main className="flex-1 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Avatar Section */}
                            <div className="flex items-center gap-8 mb-12">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-100 bg-gray-50 p-1 shadow-sm transition-transform duration-500 group-hover:scale-105">
                                        <img
                                            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.name || user?.fullName || 'profile'}`}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow-lg hover:bg-neutral-800 transition-colors">
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-gray-900">{formData.fullName || 'User'}</h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Member since 2026</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Full Name */}
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black" strokeWidth={1.5} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-black" strokeWidth={1.5} />
                                            <input
                                                type="text"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email (Read Only Example) */}
                                <div className="space-y-2 group opacity-60">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email Address (Primary)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={1.5} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full bg-transparent border-b border-gray-200 py-3 pl-8 text-gray-500 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-6 flex items-center gap-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={14} /> Save Changes</>}
                                    </button>

                                    <button
                                        type="button"
                                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Deactivate Account
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AccountProfile;

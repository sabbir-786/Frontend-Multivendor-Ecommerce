import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerSeller } from '../../store/authSlice';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Loader2, Store, Mail, Lock, User, Smartphone, Building, Navigation, Briefcase, ChevronRight, ArrowLeft, CheckCircle2
} from 'lucide-react';

// --- VALIDATION SCHEMAS ---
const accountSchema = z.object({
    sellerName: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid business email"),
    mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const businessSchema = z.object({
    businessName: z.string().min(2, "Business Name required"),
    GSTIN: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
    pinCode: z.string().regex(/^[0-9]{6}$/, "Invalid Pincode"),
    address: z.string().min(5, "Full address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
});

const bankSchema = z.object({
    accountNumber: z.string().min(8, "Invalid Account Number"),
    accountHolderName: z.string().min(2, "Holder name required"),
    ifscCode: z.string().min(11, "Invalid IFSC code"),
    bankName: z.string().min(2, "Bank name required"),
});

const SellerSignup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- VERIFICATION STATES ---
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    const [mobileVerified, setMobileVerified] = useState(false);
    const [mobileOtpSent, setMobileOtpSent] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');

    // Determine current schema based on step
    const currentSchema = step === 1 ? accountSchema : step === 2 ? businessSchema : bankSchema;

    const {
        register,
        handleSubmit,
        trigger,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onTouched"
    });

    // --- OTP API HANDLERS ---
    const handleSendOtp = async (type) => {
        const value = type === 'email' ? getValues("email") : getValues("mobile");

        const isFieldValid = await trigger(type);
        if (!isFieldValid) return;

        try {
            await api.post('/auth/sent/login-signup-otp', {
                [type]: value,
                role: 'ROLE_SELLER'
            });

            toast.success("Code Sent", { description: `OTP sent to ${value}` });

            if (type === 'email') setEmailOtpSent(true);
            else setMobileOtpSent(true);

        } catch (error) {
            toast.error("Error", { description: `Failed to send OTP to ${type}` });
        }
    };

    const handleVerifyOtp = async (type) => {
        const value = type === 'email' ? getValues("email") : getValues("mobile");
        const otp = type === 'email' ? emailOtp : mobileOtp;

        if (!otp || otp.length < 6) {
            toast.error("Invalid Input", { description: "Please enter a 6-digit OTP." });
            return;
        }

        try {
            await api.post('/auth/verify-otp-only', {
                email: type === 'email' ? value : null,
                mobile: type === 'mobile' ? value : null,
                otp: otp
            });

            toast.success("Verified", { description: `${type === 'email' ? 'Email' : 'Mobile'} has been verified.` });

            if (type === 'email') setEmailVerified(true);
            else setMobileVerified(true);

        } catch (error) {
            toast.error("Verification Failed", { description: "Invalid or expired OTP." });
        }
    };

    // --- NAVIGATION HANDLERS ---
    const handleNext = async (data) => {
        if (step === 1 && (!emailVerified || !mobileVerified)) {
            toast.warning("Verification Required", {
                description: "You must verify both your email and mobile number to continue."
            });
            return;
        }

        const isValid = await trigger();
        if (isValid) {
            setFormData(prev => ({ ...prev, ...data }));
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    // ✅ FIXED: Map React flat data to Spring Boot nested DTO
    const handleFinalSubmit = async (data) => {
        setIsSubmitting(true);
        const finalData = { ...formData, ...data };

        try {
            // Nested Payload mapping perfectly to the Java `SignupRequest`
            const payload = {
                fullName: finalData.sellerName,
                email: finalData.email,
                mobile: finalData.mobile,
                password: finalData.password,
                otp: emailOtp, // Assuming email OTP is used for backend final verification
                role: "ROLE_SELLER",
                shopName: finalData.businessName,
                gstin: finalData.GSTIN,

                // Nested BusinessDetailsRequest
                businessDetails: {
                    businessName: finalData.businessName,
                    businessEmail: finalData.email,
                    businessMobile: finalData.mobile,
                    businessAddress: finalData.address
                },

                // Nested BankDetailsRequest
                bankDetails: {
                    accountNumber: finalData.accountNumber,
                    accountHolderName: finalData.accountHolderName,
                    bankName: finalData.bankName,
                    ifscCode: finalData.ifscCode
                },

                // Nested AddressRequest
                pickupAddress: {
                    name: finalData.sellerName,
                    address: finalData.address,
                    city: finalData.city,
                    state: finalData.state,
                    pinCode: finalData.pinCode,
                    mobile: finalData.mobile
                }
            };

            await dispatch(registerSeller(payload)).unwrap();

            toast.success("Registration Successful", {
                description: "Welcome to the Partner Network. Please wait for admin approval."
            });

            navigate('/login');

        } catch (error) {
            toast.error("Registration Failed", {
                description: error || "Please check your details and try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderStepIndicator = () => (
        <div className="flex justify-center items-center mb-8 gap-4">
            {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= num ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {num}
                    </div>
                    {num < 3 && <div className={`w-10 h-px ${step > num ? 'bg-black' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white relative">
            {step > 1 ? (
                <button
                    onClick={() => setStep(prev => prev - 1)}
                    className="absolute top-8 left-8 z-50 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            ) : (
                <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors">
                    <ArrowLeft size={16} /> Home
                </Link>
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-10">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 block">
                        Partner Network
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 font-normal">
                        {step === 1 ? "Create Account" : step === 2 ? "Business Profile" : "Bank Details"}
                    </h2>
                    <div className="w-12 h-px bg-black mx-auto mt-6" />
                </div>

                {renderStepIndicator()}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <form onSubmit={step < 3 ? handleSubmit(handleNext) : handleSubmit(handleFinalSubmit)} className="space-y-6">

                            {/* --- STEP 1: ACCOUNT DETAILS --- */}
                            {step === 1 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Owner Name</label>
                                        <div className="relative">
                                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("sellerName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="John Doe" />
                                        </div>
                                        {errors.sellerName && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.sellerName.message}</p>}
                                    </div>

                                    {/* Email with Verification */}
                                    <div className="space-y-2 group">
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">
                                                Email Address
                                                {emailVerified && <CheckCircle2 size={12} className="text-green-500" />}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input
                                                {...register("email")}
                                                type="email"
                                                disabled={emailVerified}
                                                className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 pr-16 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors disabled:opacity-50"
                                                placeholder="contact@company.com"
                                            />
                                            {!emailVerified && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendOtp('email')}
                                                    className="absolute right-0 bottom-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors"
                                                >
                                                    {emailOtpSent ? "Resend" : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.email.message}</p>}

                                        {/* OTP Input UI */}
                                        {emailOtpSent && !emailVerified && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-3">
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    value={emailOtp}
                                                    onChange={(e) => setEmailOtp(e.target.value)}
                                                    placeholder="OTP"
                                                    className="flex-1 bg-gray-50 border border-gray-200 py-2.5 px-4 text-sm text-center tracking-[0.3em] font-mono focus:border-black focus:outline-none transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyOtp('email')}
                                                    className="bg-black text-white px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Mobile with Verification */}
                                    <div className="space-y-2 group">
                                        <div className="flex justify-between items-center">
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">
                                                Mobile Number
                                                {mobileVerified && <CheckCircle2 size={12} className="text-green-500" />}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input
                                                {...register("mobile")}
                                                disabled={mobileVerified}
                                                className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 pr-16 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors disabled:opacity-50"
                                                placeholder="10 Digits"
                                            />
                                            {!mobileVerified && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendOtp('mobile')}
                                                    className="absolute right-0 bottom-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors"
                                                >
                                                    {mobileOtpSent ? "Resend" : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                        {errors.mobile && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.mobile.message}</p>}

                                        {/* OTP Input UI */}
                                        {mobileOtpSent && !mobileVerified && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-3">
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    value={mobileOtp}
                                                    onChange={(e) => setMobileOtp(e.target.value)}
                                                    placeholder="OTP"
                                                    className="flex-1 bg-gray-50 border border-gray-200 py-2.5 px-4 text-sm text-center tracking-[0.3em] font-mono focus:border-black focus:outline-none transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleVerifyOtp('mobile')}
                                                    className="bg-black text-white px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("password")} type="password" className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="••••••" />
                                        </div>
                                        {errors.password && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.password.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* --- STEP 2: BUSINESS DETAILS --- */}
                            {step === 2 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Business / Store Name</label>
                                        <div className="relative">
                                            <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("businessName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="Fashion Hub Ltd." />
                                        </div>
                                        {errors.businessName && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.businessName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">GSTIN Number</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("GSTIN")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm uppercase focus:border-black focus:outline-none transition-colors" placeholder="22AAAAA0000A1Z5" />
                                        </div>
                                        {errors.GSTIN && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.GSTIN.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Pickup Address</label>
                                        <div className="relative">
                                            <Navigation className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("address")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="Street Address" />
                                        </div>
                                        {errors.address && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.address.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1 space-y-2 group">
                                            <input {...register("pinCode")} className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="Pincode" />
                                            {errors.pinCode && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.pinCode.message}</p>}
                                        </div>
                                        <div className="col-span-1 space-y-2 group">
                                            <input {...register("city")} className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="City" />
                                            {errors.city && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.city.message}</p>}
                                        </div>
                                        <div className="col-span-1 space-y-2 group">
                                            <input {...register("state")} className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="State" />
                                            {errors.state && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.state.message}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- STEP 3: BANK DETAILS --- */}
                            {step === 3 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Account Holder Name</label>
                                        <div className="relative">
                                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("accountHolderName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="As per bank records" />
                                        </div>
                                        {errors.accountHolderName && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.accountHolderName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Account Number</label>
                                        <div className="relative">
                                            <Building className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black" />
                                            <input {...register("accountNumber")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="Account Number" />
                                        </div>
                                        {errors.accountNumber && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.accountNumber.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">Bank Name</label>
                                            <input {...register("bankName")} className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-sm focus:border-black focus:outline-none transition-colors" placeholder="HDFC, SBI, etc." />
                                            {errors.bankName && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.bankName.message}</p>}
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">IFSC Code</label>
                                            <input {...register("ifscCode")} className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-sm uppercase focus:border-black focus:outline-none transition-colors" placeholder="HDFC0001234" />
                                            {errors.ifscCode && <p className="text-[10px] text-red-500 mt-1 uppercase">{errors.ifscCode.message}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Submit / Next Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {step < 3 ? "Next Step" : "Complete Registration"}
                                            {step < 3 && <ChevronRight size={14} />}
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </AnimatePresence>

                {step === 1 && (
                    <div className="text-center pt-8">
                        <p className="text-gray-500 font-light text-sm">
                            Already a seller?{" "}
                            <Link to="/login" className="font-bold text-black border-b border-black/20 hover:border-black transition-colors pb-0.5 ml-1">
                                Sign In
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerSignup;

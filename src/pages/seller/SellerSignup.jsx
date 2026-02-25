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
    Loader2, Store, Mail, Lock, User, Smartphone, Building, Navigation, Briefcase, ChevronRight, ArrowLeft, CheckCircle2, MapPin
} from 'lucide-react';

// --- VALIDATION SCHEMAS ---

// Step 1
const accountSchema = z.object({
    fullName: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Step 2
const businessSchema = z.object({
    shopName: z.string().min(2, "Shop Name required"),
    gstin: z.string().length(15, "GSTIN must be exactly 15 characters"),
    businessName: z.string().min(2, "Legal Business Name required"),
    businessEmail: z.string().email("Invalid business email"),
    businessMobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
    businessAddress: z.string().min(5, "Business address required"),
});

// Step 3
const addressSchema = z.object({
    pickupName: z.string().min(2, "Warehouse name required"),
    locality: z.string().min(2, "Locality required"),
    address: z.string().min(5, "Street address required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pinCode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
    pickupMobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
});

// Step 4
const bankSchema = z.object({
    accountHolderName: z.string().min(2, "Holder name required"),
    accountNumber: z.string().min(8, "Invalid Account Number"),
    bankName: z.string().min(2, "Bank name required"),
    ifscCode: z.string().min(11, "Invalid IFSC code"),
});

const SellerSignup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verifications
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    const [mobileVerified, setMobileVerified] = useState(false);
    const [mobileOtpSent, setMobileOtpSent] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');

    // Dynamic Schema based on Step
    const currentSchema = step === 1 ? accountSchema : step === 2 ? businessSchema : step === 3 ? addressSchema : bankSchema;

    const {
        register, handleSubmit, trigger, getValues, formState: { errors }
    } = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onTouched"
    });

    const handleSendOtp = async (type) => {
        const value = type === 'email' ? getValues("email") : getValues("mobile");
        const isFieldValid = await trigger(type);
        if (!isFieldValid) return;

        try {
            await api.post('/auth/sent/login-signup-otp', { [type]: value, role: 'ROLE_SELLER' });
            toast.success("Code Sent", { description: `OTP sent to ${value}` });
            if (type === 'email') setEmailOtpSent(true); else setMobileOtpSent(true);
        } catch (error) {
            toast.error("Error", { description: `Failed to send OTP to ${type}` });
        }
    };

    const handleVerifyOtp = async (type) => {
        const value = type === 'email' ? getValues("email") : getValues("mobile");
        const otp = type === 'email' ? emailOtp : mobileOtp;

        if (!otp || otp.length < 6) return toast.error("Invalid Input", { description: "Please enter a 6-digit OTP." });

        try {
            await api.post('/auth/verify-otp-only', {
                email: type === 'email' ? value : null,
                mobile: type === 'mobile' ? value : null,
                otp: otp
            });

            toast.success("Verified", { description: `${type === 'email' ? 'Email' : 'Mobile'} has been verified.` });

            if (type === 'email') {
                setEmailVerified(true);
                // ✅ STORE THE OTP IN FORMDATA
                setFormData(prev => ({ ...prev, verifiedEmailOtp: emailOtp }));
            } else {
                setMobileVerified(true);
            }
        } catch (error) {
            toast.error("Verification Failed", { description: "Invalid or expired OTP." });
        }
    };

    const handleNext = async (data) => {
        if (step === 1 && (!emailVerified || !mobileVerified)) {
            toast.warning("Verification Required", { description: "You must verify both email and mobile to continue." });
            return;
        }

        const isValid = await trigger();
        if (isValid) {
            setFormData(prev => ({ ...prev, ...data }));
            setStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleFinalSubmit = async (data) => {
        setIsSubmitting(true);
        const finalData = { ...formData, ...data };

        try {
            const payload = {
                email: finalData.email,
                fullName: finalData.fullName,
                password: finalData.password,
                otp: finalData.verifiedEmailOtp, // ✅ Use the stored OTP
                role: "ROLE_SELLER",
                shopName: finalData.shopName,
                mobile: finalData.mobile,
                gstin: finalData.gstin,
                businessDetails: {
                    businessName: finalData.businessName,
                    businessEmail: finalData.businessEmail,
                    businessMobile: finalData.businessMobile,
                    businessAddress: finalData.businessAddress
                },
                bankDetails: {
                    accountNumber: finalData.accountNumber,
                    accountHolderName: finalData.accountHolderName,
                    bankName: finalData.bankName,
                    ifscCode: finalData.ifscCode
                },
                pickupAddress: {
                    name: finalData.pickupName,
                    locality: finalData.locality,
                    address: finalData.address,
                    city: finalData.city,
                    state: finalData.state,
                    pinCode: finalData.pinCode,
                    mobile: finalData.pickupMobile
                }
            };

            await dispatch(registerSeller(payload)).unwrap();
            toast.success("Registration Successful", { description: "Welcome! Please wait for admin approval." });
            navigate('/login');
        } catch (error) {
            toast.error("Registration Failed", { description: error?.message || "Please check your details." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles = ["Create Account", "Business Details", "Pickup Address", "Bank Details"];

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white relative">
            {step > 1 ? (
                <button onClick={() => setStep(prev => prev - 1)} className="absolute top-8 left-8 z-50 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors">
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
                        Step {step} of 4
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 font-normal">
                        {stepTitles[step - 1]}
                    </h2>
                    <div className="w-12 h-px bg-black mx-auto mt-6" />
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center items-center mb-8 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= num ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {num}
                            </div>
                            {num < 4 && <div className={`w-8 h-px ${step > num ? 'bg-black' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full">
                        <form onSubmit={step < 4 ? handleSubmit(handleNext) : handleSubmit(handleFinalSubmit)} className="space-y-6">

                            {/* --- STEP 1: ACCOUNT --- */}
                            {step === 1 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("fullName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-gray-900 text-sm focus:border-black focus:outline-none" placeholder="Sabbir Ansari" />
                                        </div>
                                        {errors.fullName && <p className="text-[10px] text-red-500 uppercase">{errors.fullName.message}</p>}
                                    </div>

                                    {/* Email + Verify */}
                                    <div className="space-y-2 group">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                            Account Email {emailVerified && <CheckCircle2 size={12} className="text-green-500" />}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("email")} type="email" disabled={emailVerified} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 pr-16 text-sm focus:border-black focus:outline-none disabled:opacity-50" placeholder="partner@nexkart.com" />
                                            {!emailVerified && <button type="button" onClick={() => handleSendOtp('email')} className="absolute right-0 bottom-3 text-[10px] font-bold uppercase text-black hover:text-gray-500">{emailOtpSent ? "Resend" : "Verify"}</button>}
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 uppercase">{errors.email.message}</p>}

                                        {emailOtpSent && !emailVerified && (
                                            <div className="flex gap-2 mt-2">
                                                <input type="text" maxLength="6" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} placeholder="OTP" className="flex-1 border py-2 px-4 text-center tracking-[0.3em] font-mono text-sm" />
                                                <button type="button" onClick={() => handleVerifyOtp('email')} className="bg-black text-white px-6 text-[10px] font-bold uppercase">Confirm</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile + Verify */}
                                    <div className="space-y-2 group">
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                            Account Mobile {mobileVerified && <CheckCircle2 size={12} className="text-green-500" />}
                                        </label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("mobile")} disabled={mobileVerified} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 pr-16 text-sm focus:border-black focus:outline-none disabled:opacity-50" placeholder="9876543210" />
                                            {!mobileVerified && <button type="button" onClick={() => handleSendOtp('mobile')} className="absolute right-0 bottom-3 text-[10px] font-bold uppercase text-black hover:text-gray-500">{mobileOtpSent ? "Resend" : "Verify"}</button>}
                                        </div>
                                        {errors.mobile && <p className="text-[10px] text-red-500 uppercase">{errors.mobile.message}</p>}

                                        {mobileOtpSent && !mobileVerified && (
                                            <div className="flex gap-2 mt-2">
                                                <input type="text" maxLength="6" value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value)} placeholder="OTP" className="flex-1 border py-2 px-4 text-center tracking-[0.3em] font-mono text-sm" />
                                                <button type="button" onClick={() => handleVerifyOtp('mobile')} className="bg-black text-white px-6 text-[10px] font-bold uppercase">Confirm</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("password")} type="password" className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="••••••" />
                                        </div>
                                        {errors.password && <p className="text-[10px] text-red-500 uppercase">{errors.password.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* --- STEP 2: BUSINESS DETAILS --- */}
                            {step === 2 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Display Shop Name</label>
                                        <div className="relative">
                                            <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("shopName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="Nexkart Electronics" />
                                        </div>
                                        {errors.shopName && <p className="text-[10px] text-red-500 uppercase">{errors.shopName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Legal Business Name</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("businessName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="Nexkart Electronics Pvt Ltd" />
                                        </div>
                                        {errors.businessName && <p className="text-[10px] text-red-500 uppercase">{errors.businessName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">GSTIN</label>
                                        <input {...register("gstin")} className="w-full bg-transparent border-b border-gray-300 py-3 uppercase text-sm focus:border-black focus:outline-none" placeholder="22AAAAA0000A1Z5" />
                                        {errors.gstin && <p className="text-[10px] text-red-500 uppercase">{errors.gstin.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Business Email</label>
                                            <input {...register("businessEmail")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="contact@nexkart.com" />
                                            {errors.businessEmail && <p className="text-[10px] text-red-500 uppercase">{errors.businessEmail.message}</p>}
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Business Mobile</label>
                                            <input {...register("businessMobile")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="9876543210" />
                                            {errors.businessMobile && <p className="text-[10px] text-red-500 uppercase">{errors.businessMobile.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Registered Address</label>
                                        <input {...register("businessAddress")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="Tech Park, Building A" />
                                        {errors.businessAddress && <p className="text-[10px] text-red-500 uppercase">{errors.businessAddress.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* --- STEP 3: PICKUP ADDRESS --- */}
                            {step === 3 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Warehouse / Pickup Name</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("pickupName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="Primary Warehouse" />
                                        </div>
                                        {errors.pickupName && <p className="text-[10px] text-red-500 uppercase">{errors.pickupName.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Locality</label>
                                            <input {...register("locality")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="Sector 4" />
                                            {errors.locality && <p className="text-[10px] text-red-500 uppercase">{errors.locality.message}</p>}
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Pickup Contact No.</label>
                                            <input {...register("pickupMobile")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="9876543210" />
                                            {errors.pickupMobile && <p className="text-[10px] text-red-500 uppercase">{errors.pickupMobile.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Street Address</label>
                                        <input {...register("address")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="123 Main Street, Phase 2" />
                                        {errors.address && <p className="text-[10px] text-red-500 uppercase">{errors.address.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">City</label>
                                            <input {...register("city")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="City" />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">State</label>
                                            <input {...register("state")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="State" />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Pincode</label>
                                            <input {...register("pinCode")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="827004" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- STEP 4: BANK DETAILS --- */}
                            {step === 4 && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Account Holder Name</label>
                                        <div className="relative">
                                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("accountHolderName")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="As per bank records" />
                                        </div>
                                        {errors.accountHolderName && <p className="text-[10px] text-red-500 uppercase">{errors.accountHolderName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Account Number</label>
                                        <div className="relative">
                                            <Building className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input {...register("accountNumber")} className="w-full bg-transparent border-b border-gray-300 py-3 pl-8 text-sm focus:border-black focus:outline-none" placeholder="100020003000" />
                                        </div>
                                        {errors.accountNumber && <p className="text-[10px] text-red-500 uppercase">{errors.accountNumber.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Bank Name</label>
                                            <input {...register("bankName")} className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none" placeholder="HDFC Bank" />
                                            {errors.bankName && <p className="text-[10px] text-red-500 uppercase">{errors.bankName.message}</p>}
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">IFSC Code</label>
                                            <input {...register("ifscCode")} className="w-full bg-transparent border-b border-gray-300 py-3 uppercase text-sm focus:border-black focus:outline-none" placeholder="HDFC0001234" />
                                            {errors.ifscCode && <p className="text-[10px] text-red-500 uppercase">{errors.ifscCode.message}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Submit / Next Button */}
                            <div className="pt-6">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{step < 4 ? "Next Step" : "Complete Registration"} {step < 4 && <ChevronRight size={14} />}</>}
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </AnimatePresence>

                {step === 1 && (
                    <div className="text-center pt-8">
                        <p className="text-gray-500 font-light text-sm">
                            Already a seller? <Link to="/login" className="font-bold text-black border-b border-black/20 hover:border-black transition-colors pb-0.5 ml-1">Sign In</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerSignup;

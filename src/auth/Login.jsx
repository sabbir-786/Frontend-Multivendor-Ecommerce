import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
// Import your async thunks from authSlice here
import { sendOtp, verifyOtp } from "../store/authSlice";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// --- Validation Schema ---
const loginSchema = z.object({
    contact: z.string().refine(
        (val) => {
            const isEmail = z.string().email().safeParse(val).success;
            const isMobile = /^\d{10}$/.test(val);
            return isEmail || isMobile;
        },
        {
            message: "Enter a valid email or 10-digit mobile number",
        }
    ),
    otp: z.string().optional(),
});

export default function Login() {
    const [step, setStep] = useState(1);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pull loading state from Redux
    const { isLoading } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    // --- Form Submission Logic (Using Redux Thunks) ---
    const onSubmit = async (data) => {
        const isEmail = data.contact.includes("@");
        const payload = isEmail
            ? { email: data.contact }
            : { mobile: data.contact };

        if (step === 1) {
            // STEP 1: Dispatch action to request OTP
            try {
                await dispatch(
                    sendOtp({ ...payload, role: "ROLE_CUSTOMER" })
                ).unwrap();

                toast.success("OTP Sent", {
                    description: `A 6-digit code has been sent to ${data.contact}`,
                });
                setStep(2);
            } catch (error) {
                toast.error("Failed to send OTP", {
                    description: error || "Please check your details and try again.",
                });
            }
        } else {
            // STEP 2: Dispatch action to verify OTP
            if (!data.otp || data.otp.length < 6) {
                toast.warning("Invalid Input", {
                    description: "Please enter a valid 6-digit OTP.",
                });
                return;
            }

            try {
                const response = await dispatch(
                    verifyOtp({ ...payload, otp: data.otp })
                ).unwrap();

                toast.success("Login Successful", {
                    description: "Welcome back.",
                });

                // Navigate based on the role returned from the thunk payload
                const userRole = response?.role;

                if (userRole === "ROLE_SELLER") navigate("/seller/dashboard");
                else if (userRole === "ROLE_ADMIN") navigate("/admin/dashboard");
                else navigate("/");

            } catch (error) {
                // ✅ EXACT BACKEND ERROR MESSAGE UI PAR DIKHEGA
                toast.error("Authentication Failed", {
                    description: error || "Please check your OTP and try again.",
                });

                // Agar seller approved nahi hai, toh wapas step 1 par bhej do (optional)
                if (typeof error === 'string' && error.includes("approved by Admin")) {
                    setStep(1);
                }
            }
        }
    };

    const isFormLoading = isLoading || isSubmitting;

    return (
        <section className="bg-white min-h-screen flex font-sans selection:bg-black selection:text-white">
            {/* --- BACK BUTTON --- */}
            <Link
                to="/"
                className="absolute top-8 left-8 z-50 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Home
            </Link>

            {/* --- LEFT COLUMN: Image --- */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-100"
            >
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop"
                    alt="Fashion Editorial"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/10" />

                <div className="absolute bottom-12 left-12 text-white p-8 border-l border-white/30 backdrop-blur-sm">
                    <h2 className="text-4xl font-serif mb-2">Winter Collection</h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                        New Arrivals Available Now
                    </p>
                </div>
            </motion.div>

            {/* --- RIGHT COLUMN: Login Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md space-y-12"
                >
                    {/* Header */}
                    <div className="text-center">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 block">
                            Member Access
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 font-normal">
                            {step === 1 ? "Welcome Back" : "Verify Identity"}
                        </h1>
                        {step === 2 && (
                            <p className="text-sm text-gray-500 font-light mt-4">
                                We sent a 6-digit code to <br />
                                <span className="font-semibold text-gray-900">{getValues("contact")}</span>
                            </p>
                        )}
                        <div className="w-12 h-px bg-black mx-auto mt-6" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            {/* STEP 1: Contact Input */}
                            <div className={`space-y-2 group ${step === 2 ? "hidden" : "block"}`}>
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">
                                    Email or Mobile Number
                                </label>
                                <input
                                    type="text"
                                    {...register("contact")}
                                    disabled={step === 2 || isFormLoading}
                                    className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-lg font-light focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                                    placeholder="Email | Mobile Number"
                                />
                                {errors.contact && (
                                    <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider mt-2">
                                        {errors.contact.message}
                                    </p>
                                )}
                            </div>

                            {/* STEP 2: OTP Input */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2 group relative"
                                >
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-black transition-colors">
                                            Secure OTP Code
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            disabled={isFormLoading}
                                            className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-black transition-colors disabled:opacity-50"
                                        >
                                            Edit Contact?
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        maxLength="6"
                                        {...register("otp")}
                                        disabled={isFormLoading}
                                        className="w-full bg-transparent border-b border-gray-300 py-3 text-gray-900 text-3xl tracking-[0.5em] font-mono text-center focus:border-black focus:outline-none transition-colors placeholder-gray-200"
                                        placeholder="••••••"
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isFormLoading}
                            className="w-full bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all hover:px-12 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:px-10"
                        >
                            {isFormLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    {step === 1 ? "Get Secure Code" : "Verify & Sign In"}
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    {step === 1 && (
                        <div className="text-center pt-4">
                            {/* Adding quick link for Seller Signup */}
                            <p className="text-gray-500 font-light text-sm mt-2">
                                Want to sell with us?{" "}
                                <Link
                                    to="/seller/signup"
                                    className="font-bold text-black border-b border-black/20 hover:border-black transition-colors pb-0.5 ml-1"
                                >
                                    Become a Partner
                                </Link>
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

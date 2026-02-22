import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, ArrowRight } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-neutral-900 text-white pt-20 pb-10 border-t border-neutral-800 font-sans">
            <div className="container mx-auto px-6 md:px-12">

                {/* --- TOP SECTION: NEWSLETTER & SOCIALS --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20 border-b border-neutral-800 pb-16">

                    {/* Newsletter Signup */}
                    <div className="max-w-lg w-full space-y-6">
                        <h3 className="text-3xl md:text-4xl font-serif font-normal">Join our world</h3>
                        <p className="text-neutral-400 font-light leading-relaxed max-w-sm">
                            Receive updates on new arrivals, exclusive offers, and style inspiration directly to your inbox.
                        </p>

                        <form className="flex items-end gap-4 pt-2">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-transparent border-b border-neutral-700 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                            <button className="py-3 px-6 bg-white text-black text-xs font-bold uppercase tracking-[0.15em] hover:bg-neutral-200 transition-colors">
                                Sign Up
                            </button>
                        </form>
                    </div>

                    {/* Social Icons */}
                    <div className="flex flex-col gap-6 lg:items-end">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Follow Us</span>
                        <div className="flex gap-6">
                            <a href="#" className="text-white hover:text-neutral-400 transition-colors"><Facebook strokeWidth={1.5} size={20} /></a>
                            <a href="#" className="text-white hover:text-neutral-400 transition-colors"><Twitter strokeWidth={1.5} size={20} /></a>
                            <a href="#" className="text-white hover:text-neutral-400 transition-colors"><Instagram strokeWidth={1.5} size={20} /></a>
                            <a href="#" className="text-white hover:text-neutral-400 transition-colors"><Youtube strokeWidth={1.5} size={20} /></a>
                        </div>
                    </div>
                </div>

                {/* --- MIDDLE SECTION: LINKS GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 mb-20">

                    {/* Column 1 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Customer Care</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">The Company</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Our Services</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-400">
                            <li><a href="#" className="hover:text-white transition-colors">Interior Design</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Personal Shopping</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Trade Program</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Get in Touch</h4>
                        <p className="text-sm font-light text-neutral-400 leading-relaxed">
                            123 Fashion Avenue<br />
                            New York, NY 10012<br />
                            +1 (555) 123-4567<br />
                            hello@shopkart.com
                        </p>
                    </div>
                </div>

                {/* --- BOTTOM SECTION: COPYRIGHT --- */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-800 gap-4">
                    <p className="text-xs text-neutral-600">
                        © {new Date().getFullYear()} ShopKart. All rights reserved.
                    </p>

                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-neutral-600 hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-neutral-600 hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="text-xs text-neutral-600 hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;

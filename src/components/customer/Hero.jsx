import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA (FASHION THEME) ---
const slides = [
    {
        id: 1,
        // Stylish Winter/Autumn Coat Model
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        title: "WINTER EDIT '25",
        subtitle: "Elevate your cold-weather wardrobe with our premium wool coats and cashmere layers.",
        buttonText: "SHOP COLLECTION",
        products: [
            { id: 1, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200", name: "Wool Trench" },
            { id: 2, img: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&q=80&w=200", name: "Cashmere Scarf" },
            { id: 3, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200", name: "Leather Boot" },
        ]
    },
    {
        id: 2,
        // Minimalist Fashion Shot
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        title: "THE MINIMALIST",
        subtitle: "Clean lines, neutral tones, and effortless silhouettes for the modern individual.",
        buttonText: "EXPLORE NOW",
        products: [
            { id: 4, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=200", name: "Silk Blouse" },
            { id: 5, img: "https://images.unsplash.com/photo-1551488852-d7b7395a2045?auto=format&fit=crop&q=80&w=200", name: "Pleated Pant" }
        ]
    },
    {
        id: 3,
        // Urban Streetwear/Denim
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
        title: "URBAN DENIM",
        subtitle: "Reinventing the classics. Durable fabrics meeting contemporary cuts.",
        buttonText: "VIEW LOOKBOOK",
        products: [
            { id: 6, img: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&q=80&w=200", name: "Raw Denim Jacket" },
            { id: 7, img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=200", name: "Relaxed Fit Jean" }
        ]
    }
];



// --- MAIN COMPONENT ---
const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 6000); // Slightly faster for fashion
        return () => clearInterval(timer);
    }, []);

    const slide = slides[currentSlide];

    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-neutral-900">
            {/* Background Image Layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ scale: 1.1, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-top" // Focused on top for models
                    />
                    {/* Subtle gradient to ensure text readability */}
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4">
                <div className="max-w-4xl space-y-6 mt-16">
                    <motion.h1
                        key={`title-${slide.id}`}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-9xl font-serif text-white tracking-tight drop-shadow-lg mix-blend-overlay"
                    >
                        {slide.title}
                    </motion.h1>

                    <motion.p
                        key={`sub-${slide.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-white text-base md:text-lg lg:text-xl font-light max-w-xl mx-auto leading-relaxed drop-shadow-md"
                    >
                        {slide.subtitle}
                    </motion.p>

                    <motion.div
                        key={`btn-${slide.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="pt-6"
                    >
                        <button className="bg-white text-black hover:bg-neutral-200 px-10 py-4 text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300">
                            {slide.buttonText}
                        </button>
                    </motion.div>
                </div>
            </div>


            {/* Slide Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-3 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;

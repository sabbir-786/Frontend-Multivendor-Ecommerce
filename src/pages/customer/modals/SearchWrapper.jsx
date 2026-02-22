import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux"; // Commented out Redux hooks
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

// --- REDUX ACTIONS COMMENTED OUT ---
// import { searchProducts, resetProductList } from "../../store/product-slide.js";

// --- SUB-COMPONENT: SEARCH RESULT ITEM ---
const SearchResultItem = ({ product, onClose }) => {
    const navigate = useNavigate();

    // Price Logic
    const originalPrice = parseFloat(product?.price) || 0;
    const salePrice = parseFloat(product?.salePrice) || 0;
    const hasSale = salePrice > 0;

    const handleClick = () => {
        onClose();
        navigate(`/product/${product?._id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex gap-4 py-4 border-b border-gray-100 last:border-0 group cursor-pointer"
        >
            {/* Image */}
            <div className="w-16 h-20 flex-shrink-0 bg-gray-50 overflow-hidden relative">
                <img
                    src={product?.image || "https://via.placeholder.com/150"}
                    alt={product?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-gray-600 transition-colors">
                    {product?.title}
                </h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                    {product?.category || "Product"}
                </p>

                <div className="text-xs">
                    {hasSale ? (
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-black">${salePrice.toFixed(2)}</span>
                            <span className="text-gray-400 line-through scale-90">${originalPrice.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span className="font-medium text-gray-900">${originalPrice.toFixed(2)}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center text-gray-300 group-hover:text-black transition-colors">
                <ArrowRight size={16} />
            </div>
        </div>
    );
};

// --- MAIN COMPONENT: SEARCH WRAPPER ---
const SearchWrapper = ({ isOpen, onClose }) => {
    // const dispatch = useDispatch();
    const navigate = useNavigate();

    // --- SELECTORS COMMENTED OUT ---
    // const { items: searchResults, status } = useSelector((state) => state.products);
    // const isLoading = status === 'loading';

    // Fallback Dummy Data so the UI doesn't crash
    const searchResults = []; // Change this to an array of dummy objects if you want to test the results UI!
    const isLoading = false;

    const [keyword, setKeyword] = useState("");

    // Debounce Search Logic (Redux actions commented out)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (keyword && keyword.trim() !== "") {
                // dispatch(searchProducts({ query: keyword }));
            } else {
                // dispatch(resetProductList());
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [keyword /*, dispatch*/]);

    // Reset on close (Redux actions commented out)
    useEffect(() => {
        if (!isOpen) {
            setKeyword("");
            // dispatch(resetProductList());
        }
    }, [isOpen /*, dispatch*/]);

    const handleViewAll = () => {
        onClose();
        navigate(`/shop?search=${keyword}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col font-sans"
                    >
                        {/* Header & Input Area */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-serif text-gray-900">Search</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-black"
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for items..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    autoFocus
                                    className="w-full bg-gray-50 border-none p-4 pl-11 text-sm rounded-lg focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 outline-none"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">

                            {/* Case 1: Loading (Initial typing) */}
                            {isLoading && (!searchResults || searchResults.length === 0) && (
                                <div className="flex flex-col items-center justify-center pt-10 opacity-50">
                                    <p className="text-xs uppercase tracking-widest">Searching...</p>
                                </div>
                            )}

                            {/* Case 2: Has Results */}
                            {!isLoading && searchResults && searchResults.length > 0 && (
                                <div className="flex flex-col">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                                        Results ({searchResults.length})
                                    </h3>
                                    {searchResults.slice(0, 5).map((product) => (
                                        <SearchResultItem
                                            key={product._id}
                                            product={product}
                                            onClose={onClose}
                                        />
                                    ))}

                                    {searchResults.length > 5 && (
                                        <button
                                            onClick={handleViewAll}
                                            className="mt-4 w-full py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
                                        >
                                            View All Results
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Case 3: No Results (after typing) */}
                            {!isLoading && keyword.length > 1 && searchResults.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                    <p className="text-gray-900 font-medium mb-1">No matches found</p>
                                    <p className="text-xs text-gray-500">Try adjusting your search terms.</p>
                                </div>
                            )}

                            {/* Case 4: Initial State (empty input) */}
                            {!keyword && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Trending Now</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['New Arrivals', 'Dresses', 'Summer', 'Shoes'].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setKeyword(tag)}
                                                    className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 hover:bg-black hover:text-white transition-colors rounded-sm"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchWrapper;

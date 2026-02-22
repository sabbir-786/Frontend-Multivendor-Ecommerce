import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Removed useDispatch for now
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

// --- HELPER: Consistent Price & Image Logic ---
const getProductDetails = (product) => {
    if (!product) return { price: 0, image: '', name: '' };

    // 1. Image: Try 'images' array first (from ProductList), then 'image' string
    const image = product.images?.[0] || product.image || "https://via.placeholder.com/150";

    // 2. Name: Try 'name' (from ProductList), then 'title'
    const name = product.name || product.title || "Product";

    // 3. Price: Try 'discountPrice' (from ProductList), then 'salePrice', then 'price'
    const originalPrice = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.discountPrice) || parseFloat(product.salePrice) || 0;

    // If sale price exists and is greater than 0, use it. Otherwise use original.
    const finalPrice = salePrice > 0 ? salePrice : originalPrice;

    return { image, name, finalPrice };
};

// --- SUB-COMPONENT: CART ITEM (COMMENTED OUT) ---
/*
const SidebarCartItem = ({ item, userId }) => {
    const dispatch = useDispatch();
    const product = item?.productId;

    if (!product) return null;
    const { image, name, finalPrice } = getProductDetails(product);

    const handleIncrement = () => { ... };
    const handleDecrement = () => { ... };
    const handleRemove = () => { ... };

    return (
        // ... UI for cart item ...
    );
};
*/

// --- MAIN COMPONENT: CART WRAPPER / SIDEBAR ---
const CartWrapper = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // --- CART SLICE COMMENTED OUT ---
    // const { items: cartItems, status } = useSelector((state) => state.cart);

    // Fallback Dummy Data so the UI doesn't crash
    const cartItems = [];
    const status = 'idle';

    const { user } = useSelector((state) => state.auth);
    // const userId = user?._id || user?.id;

    // Calculate Subtotal (Will be 0 since cartItems is empty right now)
    const subtotal = cartItems?.reduce((total, item) => {
        const product = item?.productId;
        if (!product) return total;

        const { finalPrice } = getProductDetails(product);
        return total + (finalPrice * item.quantity);
    }, 0) || 0;

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
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
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-serif text-gray-900">
                                Shopping Bag <span className="text-sm text-gray-400 font-sans ml-1">({cartItems?.length || 0})</span>
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-black"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                            {status === 'loading' && (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                                </div>
                            )}

                            {cartItems && cartItems.length > 0 ? (
                                <div className="flex flex-col">
                                    {/* CART ITEMS MAPPING COMMENTED OUT */}
                                    {/* {cartItems.map((item) => (
                                        <SidebarCartItem
                                            key={item.productId?._id || Math.random()}
                                            item={item}
                                            userId={userId}
                                        />
                                    ))}
                                    */}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                        <ShoppingCart size={24} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-gray-500 font-light">Your bag is currently empty.</p>
                                    <button
                                        onClick={onClose}
                                        className="text-xs font-bold border-b border-black pb-0.5 uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        {cartItems && cartItems.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500 uppercase text-[10px] tracking-widest font-bold">Subtotal</span>
                                    <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mb-6 text-center leading-relaxed">
                                    Shipping, taxes, and discounts codes calculated at checkout.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Checkout <ArrowRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => { onClose(); navigate('/cart'); }}
                                        className="w-full text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                                    >
                                        View Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartWrapper;

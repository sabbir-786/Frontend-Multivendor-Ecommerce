import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ShoppingBag,
    ArrowLeft,
    Package,
    CreditCard,
    Loader2
} from "lucide-react";

import {
    removeFromCart,
    updateCartItemQuantity,
    fetchCart
} from "../store/cart-slice"; // Adjust path if needed

// --- SUB-COMPONENT: CART ITEM ---
const CartItem = ({ item, userId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const product = item?.productId;

    // Safety check: if product data is missing, don't render or render a placeholder
    if (!product) return null;

    const handleIncrement = () => {
        dispatch(updateCartItemQuantity({
            userId,
            productId: product._id,
            quantity: item.quantity + 1
        }));
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            dispatch(updateCartItemQuantity({
                userId,
                productId: product._id,
                quantity: item.quantity - 1
            }));
        } else {
            // Optional: Removing item if quantity goes to 0
            dispatch(removeFromCart({ userId, productId: product._id }));
        }
    };

    const handleRemove = () => {
        dispatch(removeFromCart({
            userId,
            productId: product._id
        }));
    };

    // Price Logic: Use salePrice if available and > 0, otherwise regular price
    const originalPrice = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.salePrice) || 0;
    const currentPrice = salePrice > 0 ? salePrice : originalPrice;
    const itemTotal = currentPrice * item.quantity;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="group flex flex-col sm:flex-row gap-6 p-6 bg-white border-b border-gray-100 last:border-0"
        >
            {/* Product Image */}
            <div
                onClick={() => navigate(`/product/${product._id}`)}
                className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer"
            >
                <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="text-base font-medium text-gray-900 leading-tight mb-1 hover:underline cursor-pointer"
                        >
                            {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            {product.category || "General"}
                        </p>

                        {/* Unit Price */}
                        <div className="text-sm">
                            {salePrice > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-red-600">${salePrice.toFixed(2)}</span>
                                    <span className="text-gray-400 line-through text-xs">${originalPrice.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="font-medium text-gray-900">${originalPrice.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    {/* Total for this line item */}
                    <p className="text-sm font-bold text-gray-900">
                        ${itemTotal.toFixed(2)}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-gray-200">
                        <button
                            onClick={handleDecrement}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30 transition-colors"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    <button
                        onClick={handleRemove}
                        className="text-xs text-gray-400 hover:text-red-600 underline decoration-gray-300 underline-offset-4 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- SUB-COMPONENT: ORDER SUMMARY ---
const OrderSummary = ({ subtotal, shipping, total, onCheckout }) => {
    return (
        <div className="bg-gray-50 p-8 lg:sticky lg:top-32 h-fit">
            <h2 className="text-lg font-serif text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Shipping Estimate</span>
                    <span className="font-medium text-gray-900">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                </div>
                <div className="h-px bg-gray-200 my-4" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={onCheckout}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3"
            >
                Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-6 flex justify-center gap-4 text-gray-400 opacity-60">
                <CreditCard className="w-5 h-5" />
                <Package className="w-5 h-5" />
                <div className="w-5 h-5 border border-current flex items-center justify-center font-serif text-[10px]">P</div>
            </div>

            <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                Taxes and duties calculated at checkout.
            </p>
        </div>
    );
};

// --- SUB-COMPONENT: EMPTY CART ---
const EmptyCart = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
    >
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-3">Your bag is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm font-light">
            Looks like you haven't added anything to your cart yet.
        </p>
        <Link
            to="/shop"
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
        >
            Start Shopping
        </Link>
    </motion.div>
);

// --- MAIN COMPONENT ---
export default function Cart() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Use correct slice selectors based on your store setup
    // Assuming 'shopCart' or 'cart' based on your previous messages
    const { items: cartItems, status } = useSelector((state) => state.shopCart || state.cart);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // 1. Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 2. Fetch Cart
    useEffect(() => {
        if (user?.id) {
            dispatch(fetchCart(user.id));
        }
    }, [dispatch, user]);

    // 3. Calculate Totals
    const subtotal = cartItems?.reduce((total, item) => {
        const product = item.productId;
        if (!product) return total;

        const price = parseFloat(product.salePrice) > 0
            ? parseFloat(product.salePrice)
            : parseFloat(product.price);

        return total + (price * item.quantity);
    }, 0) || 0;

    const shipping = subtotal > 200 ? 0 : 15;
    const total = subtotal + shipping;
    const hasItems = cartItems && cartItems.length > 0;
    const userId = user?.id;

    if (!isAuthenticated) return null; // Prevent flash before redirect

    return (
        <div className="min-h-screen bg-white font-sans pt-28 pb-20 selection:bg-black selection:text-white">
            <div className="container mx-auto px-6 md:px-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900">Shopping Cart</h1>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {cartItems?.length || 0} Items
                    </span>
                </div>

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="animate-spin w-8 h-8 text-gray-300" />
                    </div>
                )}

                {/* Error State */}
                {status === 'failed' && (
                    <div className="bg-red-50 border border-red-100 p-6 text-center max-w-lg mx-auto">
                        <p className="text-red-800 text-sm">Unable to load your cart at this moment.</p>
                        <button onClick={() => window.location.reload()} className="text-xs underline mt-2">Try Again</button>
                    </div>
                )}

                {/* Success State */}
                {status === 'succeeded' && (
                    hasItems ? (
                        <div className="flex flex-col lg:flex-row gap-16 relative">

                            {/* Cart Items List */}
                            <div className="flex-1 w-full">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item) => (
                                        <CartItem
                                            key={item.productId?._id || Math.random()}
                                            item={item}
                                            userId={userId}
                                        />
                                    ))}
                                </AnimatePresence>

                                <div className="mt-8">
                                    <button
                                        onClick={() => navigate('/shop')}
                                        className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Summary */}
                            <div className="w-full lg:w-[400px] flex-shrink-0">
                                <OrderSummary
                                    subtotal={subtotal}
                                    shipping={shipping}
                                    total={total}
                                    onCheckout={() => navigate('/checkout')}
                                />
                            </div>
                        </div>
                    ) : (
                        <EmptyCart />
                    )
                )}
            </div>
        </div>
    );
}

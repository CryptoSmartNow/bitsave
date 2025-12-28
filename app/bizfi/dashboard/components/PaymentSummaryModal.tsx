"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiOutlineXMark,
    HiOutlineCheckCircle,
    HiOutlineReceiptPercent,
    HiOutlineShieldCheck,
    HiOutlineBuildingOffice2,
    HiOutlineTag,
    HiOutlineArrowPath,
    HiOutlineGift,
    HiOutlineExclamationTriangle
} from "react-icons/hi2";

interface PaymentSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    tier: {
        id: string;
        name: string;
        price: number;
        referralPrice: number;
    };
    businessName: string;
    isReferralValid: boolean;
    referralCode: string;
}

export default function PaymentSummaryModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    tier,
    businessName,
    isReferralValid,
    referralCode
}: PaymentSummaryModalProps) {
    if (!isOpen) return null;

    const originalPrice = tier.price;
    const finalPrice = isReferralValid ? tier.referralPrice : tier.price;
    const discount = originalPrice - finalPrice;
    const discountPercentage = Math.round((discount / originalPrice) * 100);
    const hasDiscount = isReferralValid && discount > 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(15, 24, 37, 0.9)' }}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl"
                    style={{
                        backgroundColor: 'rgba(26, 37, 56, 0.98)',
                        borderColor: 'rgba(129, 215, 180, 0.2)'
                    }}
                >
                    {/* Header with gradient accent */}
                    <div
                        className="relative px-6 pt-6 pb-4"
                        style={{
                            background: 'linear-gradient(135deg, rgba(129, 215, 180, 0.1) 0%, rgba(26, 37, 56, 0) 100%)'
                        }}
                    >
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 p-2 rounded-full transition-all disabled:opacity-50"
                            style={{ color: '#7B8B9A' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                        >
                            <HiOutlineXMark className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(129, 215, 180, 0.15)' }}
                            >
                                <HiOutlineReceiptPercent className="w-6 h-6 text-[#81D7B4]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#F9F9FB]">Payment Summary</h2>
                                <p className="text-sm" style={{ color: '#7B8B9A' }}>Review before listing</p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Business Info Card */}
                        <div
                            className="p-4 rounded-2xl border"
                            style={{
                                backgroundColor: 'rgba(44, 62, 93, 0.3)',
                                borderColor: 'rgba(123, 139, 154, 0.15)'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(129, 215, 180, 0.1)' }}
                                >
                                    <HiOutlineBuildingOffice2 className="w-5 h-5 text-[#81D7B4]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#7B8B9A' }}>
                                        Business Name
                                    </p>
                                    <p className="text-base font-semibold text-[#F9F9FB] truncate">
                                        {businessName || 'Your Business'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tier Badge */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: '#7B8B9A' }}>Selected Tier</span>
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                style={{
                                    backgroundColor: 'rgba(129, 215, 180, 0.1)',
                                    border: '1px solid rgba(129, 215, 180, 0.3)'
                                }}
                            >
                                <HiOutlineTag className="w-4 h-4 text-[#81D7B4]" />
                                <span className="text-sm font-bold text-[#81D7B4] capitalize">{tier.name}</span>
                            </div>
                        </div>

                        {/* Discount Status */}
                        <div
                            className="p-3 rounded-xl flex items-center gap-3"
                            style={{
                                backgroundColor: hasDiscount ? 'rgba(129, 215, 180, 0.08)' : 'rgba(251, 191, 36, 0.08)',
                                border: `1px solid ${hasDiscount ? 'rgba(129, 215, 180, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
                            }}
                        >
                            {hasDiscount ? (
                                <>
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(129, 215, 180, 0.15)' }}
                                    >
                                        <HiOutlineGift className="w-4 h-4 text-[#81D7B4]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#81D7B4]">Discount Applied!</p>
                                        <p className="text-xs" style={{ color: '#9BA8B5' }}>
                                            Referral code <code className="px-1 py-0.5 rounded text-[#81D7B4]" style={{ backgroundColor: 'rgba(129, 215, 180, 0.1)' }}>{referralCode}</code> saves you {discountPercentage}%
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}
                                    >
                                        <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-amber-400">No Discount Applied</p>
                                        <p className="text-xs" style={{ color: '#9BA8B5' }}>
                                            You're paying the standard listing fee
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div
                            className="p-4 rounded-2xl space-y-3"
                            style={{
                                backgroundColor: 'rgba(44, 62, 93, 0.2)',
                                border: '1px solid rgba(123, 139, 154, 0.1)'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#9BA8B5' }}>Listing Fee</span>
                                <span className={`text-sm font-medium ${hasDiscount ? 'line-through text-gray-500' : 'text-[#F9F9FB]'}`}>
                                    ${originalPrice.toFixed(2)} USDC
                                </span>
                            </div>

                            {hasDiscount && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm" style={{ color: '#9BA8B5' }}>Referral Discount</span>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                backgroundColor: 'rgba(129, 215, 180, 0.15)',
                                                color: '#81D7B4'
                                            }}
                                        >
                                            {discountPercentage}% OFF
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-[#81D7B4]">
                                        -${discount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="h-px my-2" style={{ backgroundColor: 'rgba(123, 139, 154, 0.15)' }} />

                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="text-base font-semibold text-[#F9F9FB]">Total Amount</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-[#81D7B4]">
                                        ${finalPrice.toFixed(2)}
                                    </span>
                                    <span className="text-sm ml-1" style={{ color: '#7B8B9A' }}>USDC</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div
                            className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.25)' }}
                        >
                            <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4] flex-shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed" style={{ color: '#9BA8B5' }}>
                                Your payment is secured on the Base blockchain. By proceeding,
                                you authorize the transfer of USDC from your connected wallet.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div
                        className="px-6 py-5 grid grid-cols-2 gap-3"
                        style={{
                            backgroundColor: 'rgba(15, 24, 37, 0.4)',
                            borderTop: '1px solid rgba(123, 139, 154, 0.1)'
                        }}
                    >
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 text-center whitespace-nowrap"
                            style={{
                                backgroundColor: 'rgba(123, 139, 154, 0.15)',
                                color: '#9BA8B5',
                                border: '1px solid rgba(123, 139, 154, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(123, 139, 154, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(123, 139, 154, 0.15)';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
                            style={{
                                backgroundColor: '#81D7B4',
                                color: '#0F1825'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#6BC4A0';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(129, 215, 180, 0.25)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#81D7B4';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                                    <span>Processing</span>
                                </>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                    <span>Pay ${finalPrice.toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

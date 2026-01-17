"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignInWithEmail, useVerifyEmailOTP, useIsSignedIn, useSignInWithOAuth, useSignOut as useCdpSignOut, useEvmAddress } from "@coinbase/cdp-hooks";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineEnvelope, HiOutlineKey, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineArrowLeftOnRectangle, HiOutlineWallet } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

/**
 * Custom Auth Button that triggers a high z-index modal for sign-in.
 * Handles both signed-out (Login button) and signed-in (Address + Logout) states.
 * Supports both CDP Embedded Wallet and Wagmi External Wallets.
 */
export function BizFiAuthButton({ className }: { className?: string }) {
    const { isSignedIn: isCdpSignedIn } = useIsSignedIn();
    const { isConnected: isWagmiConnected } = useAccount();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // If either authentication method is active, show the signed-in view
    if (isCdpSignedIn || isWagmiConnected) {
        return <SignedInView className={className} />;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`px-4 py-2 font-bold text-[#0F1825] bg-[#81D7B4] rounded-xl hover:bg-[#6BC4A0] transition-colors ${className}`}
            >
                Login
            </button>

            <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

function SignedInView({ className }: { className?: string }) {
    const { signOut: cdpSignOut } = useCdpSignOut();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { evmAddress } = useEvmAddress();
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();

    // Determine which address to display
    const addressToDisplay = isWagmiConnected ? wagmiAddress : evmAddress;

    // Truncate address for display
    const displayAddress = addressToDisplay ? `${addressToDisplay.slice(0, 6)}...${addressToDisplay.slice(-4)}` : "Connected";

    const handleSignOut = () => {
        if (isWagmiConnected) {
            wagmiDisconnect();
        } else {
            cdpSignOut();
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] rounded-lg border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-[#81D7B4]"></div>
                <span className="text-sm font-mono text-gray-300">{displayAddress}</span>
            </div>
            <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
            >
                <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
            </button>
        </div>
    );
}

function SignInModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { signInWithEmail } = useSignInWithEmail();
    const { verifyEmailOTP } = useVerifyEmailOTP();
    const { signInWithOAuth } = useSignInWithOAuth();
    const { connect, connectors, error: wagmiError, isPending: isWagmiPending } = useConnect();

    // State
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [flowId, setFlowId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle mounting for portal
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setOtp("");
            setFlowId(null);
            setError(null);
            setLoading(false);
            setSuccess(false);
        }
    }, [isOpen]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithEmail({ email });
            setFlowId(result.flowId);
        } catch (err: any) {
            console.error("Sign in failed:", err);
            setError(err.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (!flowId) throw new Error("Session invalid. Please restart.");
            await verifyEmailOTP({ flowId, otp });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error("OTP verification failed:", err);
            setError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple' | 'x') => {
        setError(null);
        setLoading(true);
        try {
            // value passed must match OAuth2ProviderType
            await signInWithOAuth(provider);
            // OAuth usually redirects
        } catch (err: any) {
            console.error(`${provider} sign in failed:`, err);
            setError(err.message || `Failed to sign in with ${provider}.`);
            setLoading(false);
        }
    };

    const handleConnectorLogin = (connector: any) => {
        setError(null);
        setLoading(true);
        connect({ connector }, {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => onClose(), 1500);
            },
            onError: (err) => {
                console.error("Wallet connection failed:", err);
                setError(err.message || "Failed to connect wallet.");
                setLoading(false);
            }
        });
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-[#1A2538] border border-gray-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                        <h3 className="text-lg font-bold text-white">
                            {success ? "Success" : flowId ? "Verify Email" : "Sign In"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
                        >
                            <HiOutlineXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="text-xl font-bold text-white">Signed In!</h4>
                                <p className="text-gray-400 text-sm">Redirecting you to the dashboard...</p>
                            </div>
                        ) : flowId ? (
                            // OTP Form
                            <form onSubmit={handleOtpSubmit} className="space-y-4">
                                <p className="text-sm text-gray-400">
                                    We sent a verification code to <span className="text-white font-medium">{email}</span>
                                </p>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Verification Code</label>
                                    <div className="relative">
                                        <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            className="w-full bg-[#0A1016] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading || !otp}
                                    className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:bg-gray-700 disabled:text-gray-500 text-[#0A1016] rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? "Verifying..." : "Verify & Sign In"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFlowId(null)}
                                    className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                                >
                                    Use a different email
                                </button>
                            </form>
                        ) : (
                            // Initial Sign In Options
                            <div className="space-y-4">
                                {/* Social Login */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={loading}
                                        className="w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-70 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                                    >
                                        <FcGoogle className="w-5 h-5" />
                                        <span>Continue with Google</span>
                                    </button>
                                    <button
                                        onClick={() => handleSocialLogin('apple')}
                                        disabled={loading}
                                        className="w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-70 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                                    >
                                        <FaApple className="w-5 h-5" />
                                        <span>Continue with Apple</span>
                                    </button>
                                    <button
                                        onClick={() => handleSocialLogin('x')}
                                        disabled={loading}
                                        className="w-full py-3 bg-white hover:bg-gray-100 disabled:opacity-70 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        <span>Continue with X</span>
                                    </button>
                                </div>

                                {/* Wagmi Connectors */}
                                <div className="space-y-3 pt-2">
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-700/50"></div>
                                        <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Or Connect Wallet</span>
                                        <div className="flex-grow border-t border-gray-700/50"></div>
                                    </div>
                                    {connectors.filter(c => c.id === 'injected').map((connector) => (
                                        <button
                                            key={connector.uid}
                                            onClick={() => handleConnectorLogin(connector)}
                                            disabled={loading || isWagmiPending}
                                            className="w-full py-3 bg-[#1F2937] hover:bg-[#374151] border border-gray-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <svg className="w-5 h-5 text-[#81D7B4] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            <span>External Wallet</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-gray-700/50"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Or with Email</span>
                                    <div className="flex-grow border-t border-gray-700/50"></div>
                                </div>

                                {/* Email Form */}
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full bg-[#0A1016] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all"
                                            />
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading || !email}
                                        className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:bg-gray-700 disabled:text-gray-500 text-[#0A1016] rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? "Sending Code..." : "Continue with Email"}
                                        {!loading && <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}

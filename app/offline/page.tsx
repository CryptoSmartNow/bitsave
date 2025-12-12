'use client';

import { motion } from 'framer-motion';
import { WifiOff, RotateCw, Wallet } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100">

                {/* Animated Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div
                        className="absolute inset-0 bg-[#81D7B4]/20 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative w-full h-full bg-[#81D7B4]/10 rounded-full flex items-center justify-center text-[#81D7B4]">
                        <WifiOff className="w-10 h-10" />
                    </div>

                    {/* Floating Safety Badge */}
                    <motion.div
                        className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-100"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                        <Wallet className="w-5 h-5 text-[#81D7B4]" />
                    </motion.div>
                </div>

                {/* Content */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Offline</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Oops, you are not online but no fuss, your savings are sitting pretty on the blockchain.
                </p>

                {/* Action Button */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-[#81D7B4] text-white font-bold rounded-2xl hover:bg-[#6BC5A0] transition-all shadow-lg hover:shadow-[#81D7B4]/20 flex items-center justify-center gap-2 group"
                >
                    <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Try Reconnecting
                </button>

            </div>
        </div>
    );
}

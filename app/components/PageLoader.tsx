'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
    const pathname = usePathname();
    const isBizFi = pathname?.startsWith('/bizfi');

    // BizFi Colors
    const bgColor = isBizFi ? 'bg-[#0F1825]' : 'bg-white';
    const circleBg = isBizFi ? 'bg-[#1A2538]' : 'bg-white';
    const progressBg = isBizFi ? 'bg-[#1A2538]' : 'bg-gray-100';

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${bgColor}`}>
            <div className="relative flex flex-col items-center">
                {/* Logo Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-24 h-24 mb-8"
                >
                    {/* Animated Rings */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-[#81D7B4]/20"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.5, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute inset-2 rounded-full border-4 border-[#81D7B4]/40"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.6, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2,
                        }}
                    />

                    {/* Center Logo/Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center ${circleBg} shadow-sm`}>
                            <img src="/bitsavelogo.png" alt="BitSave" className="w-10 h-10 object-contain" />
                        </div>
                    </div>
                </motion.div>

                {/* Loading Text/Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-4"
                >
                    {/* Logo Text Replacement */}
                    <img src="/bitsavelogo.png" alt="BitSave" className="h-8 object-contain" />

                    {/* Progress Bar */}
                    <div className={`w-48 h-1.5 ${progressBg} rounded-full overflow-hidden`}>
                        <motion.div
                            className="h-full bg-[#81D7B4] rounded-full"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

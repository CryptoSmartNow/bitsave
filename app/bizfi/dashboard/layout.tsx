"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HiOutlineRocketLaunch,
    HiOutlineHome,
    HiOutlineVideoCamera,
    HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineQuestionMarkCircle,
    HiOutlineEllipsisVertical,
    HiOutlineBars3,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineBuildingStorefront
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import "../bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

export default function BizFiDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { href: "/bizfi/dashboard", label: "Home", icon: HiOutlineHome },
        { href: "/bizfi/dashboard/launchpad", label: "LaunchPad", icon: HiOutlineRocketLaunch },
        { href: "/bizfi/dashboard/bizcontent", label: "BizContent", icon: HiOutlineVideoCamera },
        { href: "/bizfi/dashboard/terminal", label: "BizMarket", icon: HiOutlineBuildingStorefront },
        { href: "/bizfi/dashboard/chat", label: "Chat", icon: HiOutlineChatBubbleBottomCenterText },
        { href: "/bizfi/dashboard/support", label: "Support and FAQs", icon: HiOutlineQuestionMarkCircle },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className={`${exo.variable} font-sans min-h-screen text-white relative overflow-x-hidden flex`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(123, 139, 154, 0.3) 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 lg:hidden"
                    style={{ backgroundColor: 'rgba(15, 24, 37, 0.8)' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full border-r z-40 flex flex-col transition-all duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'w-20' : 'w-64'}`}
                style={{ backgroundColor: 'rgba(26, 37, 56, 0.95)', borderColor: 'rgba(123, 139, 154, 0.2)' }}
            >
                {/* Logo */}
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                    <Link href="/bizfi" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#81D7B4' }}>
                            <HiOutlineRocketLaunch className="w-6 h-6" style={{ color: '#0F1825' }} />
                        </div>
                        {!isCollapsed && <span className="text-xl font-bold" style={{ color: '#F9F9FB' }}>BizFi</span>}
                    </Link>
                    {/* Collapse Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:block p-1 rounded-lg transition-colors"
                        style={{ color: '#7B8B9A' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {isCollapsed ? (
                            <HiOutlineChevronRight className="w-5 h-5" />
                        ) : (
                            <HiOutlineChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                            style={{
                                backgroundColor: isActive(item.href) ? 'rgba(129, 215, 180, 0.1)' : 'transparent',
                                color: isActive(item.href) ? '#81D7B4' : '#7B8B9A'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)';
                                    e.currentTarget.style.color = '#F9F9FB';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.href)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#7B8B9A';
                                }
                            }}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}

                    <button
                        onClick={() => {
                            setShowMoreModal(true);
                            setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full ${isCollapsed ? 'justify-center' : ''
                            }`}
                        style={{ color: '#7B8B9A' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)';
                            e.currentTarget.style.color = '#F9F9FB';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#7B8B9A';
                        }}
                        title={isCollapsed ? "More" : undefined}
                    >
                        <HiOutlineEllipsisVertical className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">More</span>}
                    </button>
                </nav>

                {/* Create Business Button */}
                <div className="p-4 border-t" style={{ borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                    <button
                        className={`w-full py-3 font-bold rounded-xl transition-all ${isCollapsed ? 'px-0' : ''}`}
                        style={{ backgroundColor: '#81D7B4', color: '#0F1825' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6BC4A0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#81D7B4'}
                    >
                        {isCollapsed ? '+' : 'Create Business'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Header */}
                <div className="relative z-10 border-b backdrop-blur-md sticky top-0" style={{ borderColor: 'rgba(123, 139, 154, 0.2)', backgroundColor: 'rgba(26, 37, 56, 0.8)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Hamburger Menu for Mobile */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-lg transition-colors"
                                    style={{ color: '#F9F9FB' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <HiOutlineBars3 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>

            {/* More Modal */}
            <AnimatePresence>
                {showMoreModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        style={{ backgroundColor: 'rgba(15, 24, 37, 0.8)' }}
                        onClick={() => setShowMoreModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl border shadow-2xl w-full max-w-sm p-6"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.95)', borderColor: 'rgba(123, 139, 154, 0.3)' }}
                        >
                            <div className="space-y-1 mb-6">
                                <button className="w-full text-left px-4 py-3 rounded-lg transition-colors" style={{ color: '#F9F9FB' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Business Listing Policy
                                </button>
                                <button className="w-full text-left px-4 py-3 rounded-lg transition-colors" style={{ color: '#F9F9FB' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    DMCA Policy
                                </button>
                                <button className="w-full text-left px-4 py-3 rounded-lg transition-colors" style={{ color: '#F9F9FB' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Trademark Guidelines
                                </button>
                                <button className="w-full text-left px-4 py-3 rounded-lg transition-colors" style={{ color: '#F9F9FB' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    How It Works
                                </button>
                            </div>

                            <div className="pt-4 border-t" style={{ borderColor: 'rgba(123, 139, 154, 0.3)' }}>
                                <div className="flex items-center justify-start gap-4">
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        </svg>
                                    </a>
                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

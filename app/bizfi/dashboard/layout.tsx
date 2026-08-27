'use client';

import { 
    Menu01Icon, 
    Home01Icon, 
    BarChartIcon, 
    RocketIcon, 
    Video01Icon, 
    Message02Icon, 
    InformationCircleIcon,
    HelpCircleIcon,
    ArrowLeft01Icon,
    PanelLeftCloseIcon,
    PanelLeftOpenIcon
} from "hugeicons-react";
import { useState } from "react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import "../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

export default function BizFiDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { href: "/bizfi/dashboard", label: "Biz Dashboard", icon: BarChartIcon },
        { href: "/bizfi/dashboard/launchpad", label: "LaunchPad", icon: RocketIcon },
        { href: "/bizfi/dashboard/bizcontent", label: "BizContent", icon: Video01Icon },
        { href: "/bizfi/dashboard/chat", label: "Chat", icon: Message02Icon },
        { href: "/bizfi/dashboard/support", label: "Support & FAQs", icon: InformationCircleIcon },
        { href: "/bizfi/dashboard/feedback", label: "Help & Feedback", icon: HelpCircleIcon },
    ];

    const isActive = (href: string) => {
        if (href === "/bizfi/dashboard") return pathname === "/bizfi/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] font-sans flex w-full max-w-full relative selection:bg-[#81D7B4] selection:text-[#0F1825]">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#81D7B4]/5 blur-[150px]" />
                <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#2C3E5D]/20 blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#1A2538]/40 blur-[150px]" />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-[#0A1019]/80 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed left-0 top-0 h-full border-r border-[#7B8B9A]/15 z-50 flex flex-col transition-all duration-300 lg:translate-x-0 bg-[#0F1825]/95 backdrop-blur-2xl ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Logo & Brand Header */}
                <div className={`p-4 sm:p-5 border-b border-[#7B8B9A]/15 flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'}`}>
                    <Link href="/bizfi" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] font-black text-sm shadow-[0_0_15px_rgba(129,215,180,0.3)] group-hover:scale-105 transition-transform shrink-0">
                            B
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-black text-base tracking-tight text-[#F9F9FB]">BizFi</span>
                                <span className="text-[10px] text-[#7B8B9A] font-semibold tracking-wider uppercase -mt-0.5">Console</span>
                            </div>
                        )}
                    </Link>

                    {/* Collapse Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex p-1.5 rounded-lg transition-colors text-[#7B8B9A] hover:bg-[#1A2538] hover:text-[#81D7B4] border border-transparent hover:border-[#7B8B9A]/20 cursor-pointer"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <PanelLeftOpenIcon className="w-4 h-4" />
                        ) : (
                            <PanelLeftCloseIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    <div className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7B8B9A] ${isCollapsed ? 'text-center' : ''}`}>
                        {isCollapsed ? '•' : 'Main Navigation'}
                    </div>

                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                                    isCollapsed ? 'justify-center px-0' : ''
                                } ${active
                                    ? 'bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30 shadow-sm font-bold'
                                    : 'text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#1A2538]/60 border border-transparent'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#81D7B4]' : 'text-[#7B8B9A]'}`} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Return to SaveFi Secondary Button */}
                <div className="p-3 border-t border-[#7B8B9A]/15 bg-[#0A1019]/40">
                    <Link
                        href="/dashboard"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 font-bold text-xs rounded-xl transition-all bg-[#1A2538]/80 hover:bg-[#1A2538] text-[#9BA8B5] hover:text-[#F9F9FB] border border-[#7B8B9A]/20 ${
                            isCollapsed ? 'px-0' : ''
                        }`}
                        title="Return to SaveFi"
                    >
                        <ArrowLeft01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                        {!isCollapsed && <span>SaveFi Protocol</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Dashboard Canvas Area */}
            <div className={`flex-1 min-w-0 transition-all duration-300 relative z-10 ${
                isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}>
                {/* Top Nav Header */}
                <header className="sticky top-0 z-30 border-b border-[#7B8B9A]/15 bg-[#0F1825]/90 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left: Mobile Menu & Breadcrumbs */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-xl text-[#F9F9FB] bg-[#1A2538] border border-[#7B8B9A]/20 hover:bg-[#2C3E5D]/40 transition-colors"
                                    aria-label="Open menu"
                                >
                                    <Menu01Icon className="w-4 h-4" />
                                </button>
                                
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <Link href="/bizfi" className="text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors">BizFi</Link>
                                    <span className="text-[#7B8B9A]/50">/</span>
                                    <span className="text-[#81D7B4]">Console</span>
                                </div>
                            </div>

                            {/* Right: Quick Action Links */}
                            <div className="flex items-center gap-2.5">
                                <Link 
                                    href="/bizfi/dashboard/feedback"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#81D7B4] bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 border border-[#81D7B4]/30 rounded-xl transition-all"
                                >
                                    <HelpCircleIcon className="w-3.5 h-3.5" />
                                    <span>Support Desk</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main View Area */}
                <main className="relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

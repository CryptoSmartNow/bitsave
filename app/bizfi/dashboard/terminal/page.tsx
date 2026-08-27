'use client';

import Link from 'next/link';
import { Instrument_Serif } from "next/font/google";
import { Building04Icon, ArrowLeft01Icon, RocketIcon } from "hugeicons-react";
import "../../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

export default function TerminalPage() {
    return (
        <div className="w-full min-h-[75vh] px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
            <div className="max-w-md w-full bg-[#1A2538]/30 backdrop-blur-xl border border-[#7B8B9A]/15 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/10 border border-[#81D7B4]/25 flex items-center justify-center mx-auto text-[#81D7B4]">
                    <Building04Icon className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#F9F9FB]">
                        Secondary Liquidity <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Exchange</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed">
                        The secondary marketplace and liquidity pool for tokenized BizShares is currently undergoing scheduled protocol upgrades.
                    </p>
                </div>

                <div className="p-3.5 bg-[#0F1825]/60 border border-[#7B8B9A]/15 rounded-2xl">
                    <span className="text-[11px] font-semibold text-[#81D7B4]">
                        Status: Launching Post-Pilot Attestations
                    </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/bizfi/dashboard"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold text-xs rounded-xl transition-all"
                    >
                        <ArrowLeft01Icon className="w-4 h-4" />
                        <span>Return to Dashboard</span>
                    </Link>
                    <Link
                        href="/bizfi/dashboard/launchpad"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A2538] hover:bg-[#2C3E5D]/60 border border-[#7B8B9A]/20 text-[#F9F9FB] font-semibold text-xs rounded-xl transition-all"
                    >
                        <RocketIcon className="w-4 h-4 text-[#81D7B4]" />
                        <span>Launchpad</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

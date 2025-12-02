"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    HiOutlineArrowTrendingUp,
    HiOutlineArrowTrendingDown,
    HiOutlineChartBar,
    HiOutlineClock
} from "react-icons/hi2";
import { Exo } from "next/font/google";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Mock trading data
const MOCK_PRICE_DATA = [
    { time: '09:00', open: 12.5, high: 13.2, low: 12.3, close: 13.0 },
    { time: '10:00', open: 13.0, high: 13.5, low: 12.8, close: 13.2 },
    { time: '11:00', open: 13.2, high: 13.8, low: 13.0, close: 13.5 },
    { time: '12:00', open: 13.5, high: 14.0, low: 13.3, close: 13.8 },
    { time: '13:00', open: 13.8, high: 14.2, low: 13.6, close: 14.0 },
    { time: '14:00', open: 14.0, high: 14.5, low: 13.9, close: 14.3 },
    { time: '15:00', open: 14.3, high: 14.8, low: 14.1, close: 14.5 },
];

const ORDER_BOOK = {
    bids: [
        { price: 14.48, amount: 125.5, total: 1818.24 },
        { price: 14.47, amount: 89.2, total: 1290.72 },
        { price: 14.46, amount: 234.1, total: 3385.09 },
        { price: 14.45, amount: 156.8, total: 2265.76 },
        { price: 14.44, amount: 92.3, total: 1332.81 },
    ],
    asks: [
        { price: 14.51, amount: 98.4, total: 1427.78 },
        { price: 14.52, amount: 145.2, total: 2108.30 },
        { price: 14.53, amount: 67.9, total: 986.59 },
        { price: 14.54, amount: 203.5, total: 2958.89 },
        { price: 14.55, amount: 112.6, total: 1638.33 },
    ]
};

const RECENT_TRADES = [
    { price: 14.50, amount: 12.5, time: '15:23:45', type: 'buy' },
    { price: 14.49, amount: 8.3, time: '15:23:42', type: 'sell' },
    { price: 14.51, amount: 15.7, time: '15:23:38', type: 'buy' },
    { price: 14.48, amount: 6.2, time: '15:23:35', type: 'sell' },
    { price: 14.50, amount: 22.1, time: '15:23:30', type: 'buy' },
];

export default function TerminalPage() {
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('14.50');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] text-white p-4 sm:p-6 lg:p-8`}>
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Trading Terminal</h1>
                        <p className="text-sm sm:text-base text-gray-400">Trade business tokens on BizMarket</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-gray-400">Current Price</p>
                            <p className="text-xl sm:text-2xl font-bold text-[#81D7B4]">$14.50</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-gray-400">24h Change</p>
                            <p className="text-base sm:text-lg font-bold text-green-400 flex items-center gap-1">
                                <HiOutlineArrowTrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
                                +5.2%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Price Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">24h High</p>
                            <p className="text-base sm:text-lg font-bold text-white">$14.80</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">24h Low</p>
                            <p className="text-base sm:text-lg font-bold text-white">$12.30</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                            <p className="text-base sm:text-lg font-bold text-white">$2.5M</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 sm:p-4">
                            <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                            <p className="text-base sm:text-lg font-bold text-white">$125M</p>
                        </div>
                    </div>

                    {/* Candlestick Chart */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Price Chart</h2>
                            <div className="flex gap-2">
                                {['1H', '4H', '1D', '1W', '1M'].map((timeframe) => (
                                    <button
                                        key={timeframe}
                                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                    >
                                        {timeframe}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Simple Candlestick Visualization */}
                        <div className="h-96 flex items-end justify-around gap-2 px-4">
                            {MOCK_PRICE_DATA.map((candle, index) => {
                                const isGreen = candle.close >= candle.open;
                                const bodyHeight = Math.abs(candle.close - candle.open) * 20;
                                const wickTop = (candle.high - Math.max(candle.open, candle.close)) * 20;
                                const wickBottom = (Math.min(candle.open, candle.close) - candle.low) * 20;
                                const bottomPosition = candle.low * 20;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center relative" style={{ height: '100%' }}>
                                        <div className="flex-1 flex flex-col justify-end items-center w-full">
                                            {/* Top wick */}
                                            <div
                                                className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ height: `${wickTop}px` }}
                                            />
                                            {/* Body */}
                                            <div
                                                className={`w-full ${isGreen ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                                                style={{ height: `${bodyHeight}px`, minHeight: '2px' }}
                                            />
                                            {/* Bottom wick */}
                                            <div
                                                className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ height: `${wickBottom}px` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">{candle.time}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-4 text-xs text-gray-400 font-bold pb-2 border-b border-gray-800">
                                <div>Price</div>
                                <div>Amount</div>
                                <div>Time</div>
                                <div>Type</div>
                            </div>
                            {RECENT_TRADES.map((trade, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 text-sm py-2 hover:bg-gray-800/50 rounded transition-colors">
                                    <div className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                                        ${trade.price.toFixed(2)}
                                    </div>
                                    <div className="text-white">{trade.amount}</div>
                                    <div className="text-gray-400">{trade.time}</div>
                                    <div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {trade.type.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trading Panel */}
                <div className="space-y-6">
                    {/* Buy/Sell Tabs */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setOrderType('buy')}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'buy'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setOrderType('sell')}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'sell'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                Sell
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Price (USD)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-2">
                                {['25%', '50%', '75%', '100%'].map((percent) => (
                                    <button
                                        key={percent}
                                        className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                    >
                                        {percent}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Total</span>
                                    <span className="text-white font-bold">
                                        ${(parseFloat(price || '0') * parseFloat(amount || '0')).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${orderType === 'buy'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {orderType === 'buy' ? 'Buy' : 'Sell'} BizToken
                            </button>
                        </div>
                    </div>

                    {/* Order Book */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Order Book</h2>

                        {/* Asks */}
                        <div className="mb-4">
                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-bold mb-2">
                                <div>Price</div>
                                <div className="text-right">Amount</div>
                                <div className="text-right">Total</div>
                            </div>
                            {ORDER_BOOK.asks.reverse().map((ask, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1">
                                    <div className="text-red-400">${ask.price.toFixed(2)}</div>
                                    <div className="text-white text-right">{ask.amount.toFixed(1)}</div>
                                    <div className="text-gray-400 text-right">${ask.total.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Current Price */}
                        <div className="py-3 my-3 bg-gray-800 rounded-lg text-center">
                            <span className="text-[#81D7B4] font-bold text-lg">$14.50</span>
                        </div>

                        {/* Bids */}
                        <div>
                            {ORDER_BOOK.bids.map((bid, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1">
                                    <div className="text-green-400">${bid.price.toFixed(2)}</div>
                                    <div className="text-white text-right">{bid.amount.toFixed(1)}</div>
                                    <div className="text-gray-400 text-right">${bid.total.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

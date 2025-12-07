"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    HiOutlineArrowTrendingUp,
    HiOutlineArrowTrendingDown,
    HiOutlineChartBar,
    HiOutlineClock
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import "../../bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Generate random price movement
const generatePriceChange = (basePrice: number) => {
    const change = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and +0.25
    return Number((basePrice + change).toFixed(2));
};

// Generate random trade
const generateTrade = (currentPrice: number): { price: number; amount: number; time: string; type: 'buy' | 'sell' } => {
    const type: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    const amount = Number((Math.random() * 30 + 5).toFixed(1));
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    return {
        price: Number((currentPrice + (Math.random() - 0.5) * 0.1).toFixed(2)),
        amount,
        time,
        type
    };
};

// Generate initial candlestick data
const generateInitialCandles = (basePrice: number, count: number = 50) => {
    const candles = [];
    let currentPrice = basePrice;

    for (let i = 0; i < count; i++) {
        const open = currentPrice;
        const change = (Math.random() - 0.5) * 0.8;
        const close = Number((open + change).toFixed(2));
        const high = Number((Math.max(open, close) + Math.random() * 0.3).toFixed(2));
        const low = Number((Math.min(open, close) - Math.random() * 0.3).toFixed(2));

        candles.push({ open, high, low, close });
        currentPrice = close;
    }

    return candles;
};

// Candlestick component
const Candlestick = ({ candle, index, maxPrice, minPrice, height }: {
    candle: { open: number; high: number; low: number; close: number },
    index: number,
    maxPrice: number,
    minPrice: number,
    height: number
}) => {
    const priceRange = maxPrice - minPrice;
    const isGreen = candle.close >= candle.open;

    const bodyTop = ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * height;
    const bodyBottom = ((maxPrice - Math.min(candle.open, candle.close)) / priceRange) * height;
    const bodyHeight = bodyBottom - bodyTop;

    const wickTop = ((maxPrice - candle.high) / priceRange) * height;
    const wickBottom = ((maxPrice - candle.low) / priceRange) * height;

    return (
        <g>
            {/* Wick */}
            <line
                x1={index * 8 + 4}
                y1={wickTop}
                x2={index * 8 + 4}
                y2={wickBottom}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth="1"
                opacity="0.6"
            />
            {/* Body */}
            <rect
                x={index * 8 + 1}
                y={bodyTop}
                width="6"
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? '#10b981' : '#ef4444'}
                opacity="0.8"
            />
        </g>
    );
};

export default function TerminalPage() {
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('14.50');
    const [mounted, setMounted] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(14.50);
    const [priceChange, setPriceChange] = useState(5.2);
    const [candleData, setCandleData] = useState(() => generateInitialCandles(14.50));
    const [recentTrades, setRecentTrades] = useState([
        { price: 14.50, amount: 12.5, time: '15:23:45', type: 'buy' as const },
        { price: 14.49, amount: 8.3, time: '15:23:42', type: 'sell' as const },
        { price: 14.51, amount: 15.7, time: '15:23:38', type: 'buy' as const },
        { price: 14.48, amount: 6.2, time: '15:23:35', type: 'sell' as const },
        { price: 14.50, amount: 22.1, time: '15:23:30', type: 'buy' as const },
    ]);

    useEffect(() => {
        setMounted(true);

        // Update price every 3 seconds
        const priceInterval = setInterval(() => {
            setCurrentPrice(prev => {
                const newPrice = generatePriceChange(prev);
                setPrice(newPrice.toFixed(2));

                // Calculate price change percentage
                const change = ((newPrice - 14.50) / 14.50) * 100;
                setPriceChange(Number(change.toFixed(2)));

                return newPrice;
            });
        }, 3000);

        // Add new trade every 5 seconds
        const tradeInterval = setInterval(() => {
            setRecentTrades(prev => {
                const newTrade = generateTrade(currentPrice);
                return [newTrade, ...prev.slice(0, 9)]; // Keep only last 10 trades
            });
        }, 5000);

        // Update chart every 8 seconds
        const chartInterval = setInterval(() => {
            setCandleData(prev => {
                const lastCandle = prev[prev.length - 1];
                const open = lastCandle.close;
                const change = (Math.random() - 0.5) * 0.8;
                const close = Number((open + change).toFixed(2));
                const high = Number((Math.max(open, close) + Math.random() * 0.3).toFixed(2));
                const low = Number((Math.min(open, close) - Math.random() * 0.3).toFixed(2));

                const newCandles = [...prev.slice(1), { open, high, low, close }];
                return newCandles;
            });
        }, 8000);

        return () => {
            clearInterval(priceInterval);
            clearInterval(tradeInterval);
            clearInterval(chartInterval);
        };
    }, [currentPrice]);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    const high24h = Number((currentPrice * 1.05).toFixed(2));
    const low24h = Number((currentPrice * 0.95).toFixed(2));
    const volume24h = (Math.random() * 3 + 2).toFixed(1);
    const marketCap = (currentPrice * 8.6).toFixed(0);

    return (
        <div className={`${exo.variable} font-sans min-h-screen text-white p-4 sm:p-6 lg:p-8`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#F9F9FB' }}>BizMarket Terminal</h1>
                        <p className="text-sm sm:text-base" style={{ color: '#7B8B9A' }}>Live trading terminal for business tokens</p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <motion.div
                            className="text-left sm:text-right"
                            key={currentPrice}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-xs sm:text-sm" style={{ color: '#7B8B9A' }}>Current Price</p>
                            <p className="text-xl sm:text-2xl font-bold text-[#81D7B4]">${currentPrice.toFixed(2)}</p>
                        </motion.div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm" style={{ color: '#7B8B9A' }}>24h Change</p>
                            <p className={`text-base sm:text-lg font-bold flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceChange >= 0 ? (
                                    <HiOutlineArrowTrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
                                ) : (
                                    <HiOutlineArrowTrendingDown className="w-4 sm:w-5 h-4 sm:h-5" />
                                )}
                                {priceChange >= 0 ? '+' : ''}{priceChange}%
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
                        <div className="rounded-xl border p-3 sm:p-4" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                            <p className="text-xs mb-1" style={{ color: '#7B8B9A' }}>24h High</p>
                            <p className="text-base sm:text-lg font-bold" style={{ color: '#F9F9FB' }}>${high24h}</p>
                        </div>
                        <div className="rounded-xl border p-3 sm:p-4" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                            <p className="text-xs mb-1" style={{ color: '#7B8B9A' }}>24h Low</p>
                            <p className="text-base sm:text-lg font-bold" style={{ color: '#F9F9FB' }}>${low24h}</p>
                        </div>
                        <div className="rounded-xl border p-3 sm:p-4" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                            <p className="text-xs mb-1" style={{ color: '#7B8B9A' }}>24h Volume</p>
                            <p className="text-base sm:text-lg font-bold" style={{ color: '#F9F9FB' }}>${volume24h}M</p>
                        </div>
                        <div className="rounded-xl border p-3 sm:p-4" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                            <p className="text-xs mb-1" style={{ color: '#7B8B9A' }}>Market Cap</p>
                            <p className="text-base sm:text-lg font-bold" style={{ color: '#F9F9FB' }}>${marketCap}M</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: '#F9F9FB' }}>Price Chart</h2>
                            <div className="flex gap-2">
                                {['1H', '4H', '1D', '1W', '1M'].map((timeframe) => (
                                    <button
                                        key={timeframe}
                                        className="px-3 py-1 rounded-lg text-sm transition-colors"
                                        style={{ backgroundColor: 'rgba(44, 62, 93, 0.6)', color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(129, 215, 180, 0.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.6)'}
                                    >
                                        {timeframe}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-96 rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(15, 24, 37, 0.5)' }}>
                            <svg width="100%" height="100%" viewBox="0 0 400 384" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <g opacity="0.1">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <line
                                            key={`h-${i}`}
                                            x1="0"
                                            y1={i * 96}
                                            x2="400"
                                            y2={i * 96}
                                            stroke="#7B8B9A"
                                            strokeWidth="1"
                                        />
                                    ))}
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                        <line
                                            key={`v-${i}`}
                                            x1={i * 40}
                                            y1="0"
                                            x2={i * 40}
                                            y2="384"
                                            stroke="#7B8B9A"
                                            strokeWidth="1"
                                        />
                                    ))}
                                </g>

                                {/* Candlesticks */}
                                <motion.g
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {candleData.map((candle, index) => {
                                        const maxPrice = Math.max(...candleData.map(c => c.high));
                                        const minPrice = Math.min(...candleData.map(c => c.low));
                                        return (
                                            <Candlestick
                                                key={index}
                                                candle={candle}
                                                index={index}
                                                maxPrice={maxPrice}
                                                minPrice={minPrice}
                                                height={384}
                                            />
                                        );
                                    })}
                                </motion.g>

                                {/* Current price line */}
                                <motion.line
                                    x1="0"
                                    y1="192"
                                    x2="400"
                                    y2="192"
                                    stroke="#81D7B4"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    opacity="0.5"
                                    animate={{ y: [190, 194, 190] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#F9F9FB' }}>Recent Trades</h2>
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-4 text-xs font-bold pb-2 border-b" style={{ color: '#7B8B9A', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                                <div>Price</div>
                                <div>Amount</div>
                                <div>Time</div>
                                <div>Type</div>
                            </div>
                            <AnimatePresence mode="popLayout">
                                {recentTrades.map((trade, index) => (
                                    <motion.div
                                        key={`${trade.time}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-4 gap-4 text-sm py-2 rounded transition-colors"
                                        style={{ backgroundColor: index === 0 ? 'rgba(129, 215, 180, 0.05)' : 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index === 0 ? 'rgba(129, 215, 180, 0.05)' : 'transparent'}
                                    >
                                        <div className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                                            ${trade.price.toFixed(2)}
                                        </div>
                                        <div style={{ color: '#F9F9FB' }}>{trade.amount}</div>
                                        <div style={{ color: '#7B8B9A' }}>{trade.time}</div>
                                        <div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {trade.type.toUpperCase()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Trading Panel */}
                <div className="space-y-6">
                    {/* Buy/Sell Form */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setOrderType('buy')}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'buy'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-400'
                                    }`}
                                style={{ backgroundColor: orderType === 'buy' ? '#10b981' : 'rgba(44, 62, 93, 0.6)' }}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setOrderType('sell')}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${orderType === 'sell'
                                    ? 'bg-red-500 text-white'
                                    : 'text-gray-400'
                                    }`}
                                style={{ backgroundColor: orderType === 'sell' ? '#ef4444' : 'rgba(44, 62, 93, 0.6)' }}
                            >
                                Sell
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2" style={{ color: '#7B8B9A' }}>Price (USD)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.6)', borderColor: 'rgba(123, 139, 154, 0.3)', color: '#F9F9FB' }}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-2" style={{ color: '#7B8B9A' }}>Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.6)', borderColor: 'rgba(123, 139, 154, 0.3)', color: '#F9F9FB' }}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-2">
                                {['25%', '50%', '75%', '100%'].map((percent) => (
                                    <button
                                        key={percent}
                                        className="flex-1 py-2 rounded-lg text-sm transition-colors"
                                        style={{ backgroundColor: 'rgba(44, 62, 93, 0.6)', color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(129, 215, 180, 0.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.6)'}
                                    >
                                        {percent}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t" style={{ borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span style={{ color: '#7B8B9A' }}>Total</span>
                                    <span className="font-bold" style={{ color: '#F9F9FB' }}>
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
                                {orderType === 'buy' ? 'Buy' : 'Sell'} BizShares
                            </button>
                        </div>
                    </div>

                    {/* Market Activity */}
                    <div className="rounded-xl border p-6" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#F9F9FB' }}>Market Activity</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#7B8B9A' }}>Buyers</span>
                                <span className="text-sm font-bold text-green-400">
                                    {Math.floor(Math.random() * 50 + 100)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#7B8B9A' }}>Sellers</span>
                                <span className="text-sm font-bold text-red-400">
                                    {Math.floor(Math.random() * 40 + 80)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#7B8B9A' }}>Trades (24h)</span>
                                <span className="text-sm font-bold" style={{ color: '#F9F9FB' }}>
                                    {Math.floor(Math.random() * 500 + 1000)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

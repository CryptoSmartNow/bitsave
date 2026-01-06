import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineCheckCircle, HiOutlineClipboard, HiOutlineArrowTopRightOnSquare, HiOutlineCreditCard, HiOutlineArrowPath, HiOutlinePaperAirplane, HiOutlineArrowLeft, HiOutlineWallet } from "react-icons/hi2";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useBizFi } from "../../hooks/useBizFi";

interface WalletDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: `0x${string}` | undefined;
    logout: () => void;
}

// Base Mainnet USDC
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

type ViewState = 'details' | 'send';
type TokenType = 'ETH' | 'USDC';

export default function WalletDetailsModal({ isOpen, onClose, address, logout }: WalletDetailsModalProps) {
    const [view, setView] = useState<ViewState>('details');
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Send State
    const [selectedToken, setSelectedToken] = useState<TokenType>('USDC');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState<string | null>(null);

    const { chain } = useAccount();
    const { transferToken, loading, error } = useBizFi();

    // ETH Balance
    const { data: ethBalance, refetch: refetchEth } = useBalance({
        address: address,
    });

    // USDC Balance
    const { data: usdcBalance, refetch: refetchUsdc } = useBalance({
        address: address,
        token: USDC_ADDRESS,
    });

    const handleCopy = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const refreshBalances = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchEth(), refetchUsdc()]);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const receipt = await transferToken(recipient, amount, selectedToken);
            setTxHash(receipt.transactionHash);
            refreshBalances();
        } catch (err) {
            // Error handled by hook
        }
    };

    const resetSendState = () => {
        setRecipient('');
        setAmount('');
        setTxHash(null);
        setView('details');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-sm bg-gray-900/80"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#1A2538]/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/30">
                        <div className="flex items-center gap-3">
                            {view === 'send' ? (
                                <button onClick={resetSendState} className="p-1 -ml-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                                    <HiOutlineArrowLeft className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#81D7B4] p-[2px] flex items-center justify-center">
                                    <div className="w-full h-full rounded-full bg-[#1A2538] flex items-center justify-center">
                                        <HiOutlineWallet className="w-5 h-5 text-[#81D7B4]" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">
                                    {view === 'send' ? 'Send Assets' : 'Wallet Details'}
                                </h3>
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></span>
                                    {chain?.name || 'Base Network'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
                        >
                            <HiOutlineXMark className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {view === 'details' ? (
                            <div className="space-y-5">
                                {/* Address Section */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative bg-gray-800/40 rounded-2xl p-4 border border-gray-700/50 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Connected Address</p>
                                        <div className="flex flex-col gap-2">
                                            <code className="text-xs font-mono text-white leading-relaxed truncate">
                                                {address}
                                            </code>
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gray-700/50 hover:bg-[#81D7B4]/10 border border-gray-600/50 hover:border-[#81D7B4]/50 text-gray-300 hover:text-[#81D7B4] transition-all font-medium text-xs group/btn"
                                            >
                                                {copied ? (
                                                    <>
                                                        <HiOutlineCheckCircle className="w-4 h-4" />
                                                        <span>Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <HiOutlineClipboard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                        <span>Copy Address</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Balances */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Assets</h4>
                                        <button
                                            onClick={refreshBalances}
                                            disabled={isRefreshing}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800 text-[10px] font-medium text-[#81D7B4] hover:text-[#6BC4A0] transition-colors disabled:opacity-50"
                                        >
                                            <HiOutlineArrowPath className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                        </button>
                                    </div>

                                    <div className="grid gap-2">
                                        {/* ETH */}
                                        <div className="group flex items-center justify-between p-3 rounded-2xl bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#627EEA]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <svg className="w-5 h-5 text-[#627EEA]" viewBox="0 0 32 32" fill="currentColor">
                                                        <path d="M15.925 23.96l-9.819-5.796L15.925 32l9.83-13.836-9.83 5.796zM16.075 0L6.255 16.332l9.82 5.806 9.82-5.806L16.075 0zm0 20.686l-8.48-5.013 8.48-14.103 8.486 14.103-8.486 5.013z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">Base ETH</p>
                                                    <p className="text-[10px] text-gray-400">Gas Token</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white font-mono text-sm">
                                                    {ethBalance ? Number(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4) : '0.0000'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">ETH</p>
                                            </div>
                                        </div>

                                        {/* USDC */}
                                        <div className="group flex items-center justify-between p-3 rounded-2xl bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2775CA]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <img src="/usdclogo.png" alt="USDC" className="w-5 h-5 object-contain" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">USDC</p>
                                                    <p className="text-[10px] text-gray-400">Stablecoin</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white font-mono text-sm">
                                                    {usdcBalance ? Number(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2) : '0.00'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">USDC</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setView('send')}
                                        className="group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium transition-all border border-gray-700/50 hover:border-gray-600 hover:-translate-y-0.5"
                                    >
                                        <div className="p-2 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] group-hover:scale-110 transition-transform">
                                            <HiOutlinePaperAirplane className="w-4 h-4 -rotate-45 translate-x-0.5" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Send</span>
                                    </button>

                                    <a
                                        href={`https://basescan.org/address/${address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium transition-all border border-gray-700/50 hover:border-gray-600 hover:-translate-y-0.5"
                                    >
                                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                            <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider">History</span>
                                    </a>

                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('openBuyCryptoModal');
                                            window.dispatchEvent(event);
                                            onClose();
                                        }}
                                        className="group flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium transition-all border border-gray-700/50 hover:border-gray-600 hover:-translate-y-0.5"
                                    >
                                        <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                            <HiOutlineCreditCard className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Buy</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="pt-2 border-t border-gray-700/30">
                                    <button
                                        onClick={() => {
                                            logout();
                                            onClose();
                                        }}
                                        className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
                                    >
                                        Disconnect Wallet
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Send View
                            <form onSubmit={handleSend} className="space-y-5">
                                {txHash ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">Sent Successfully!</h4>
                                            <a
                                                href={`https://basescan.org/tx/${txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-[#81D7B4] hover:underline mt-2 inline-block"
                                            >
                                                View on Explorer
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetSendState}
                                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold mt-4"
                                        >
                                            Send Another
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Token Selector */}
                                        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                            {(['USDC', 'ETH'] as const).map((token) => (
                                                <button
                                                    key={token}
                                                    type="button"
                                                    onClick={() => setSelectedToken(token)}
                                                    className={`py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedToken === token
                                                        ? 'bg-[#81D7B4] text-[#0A1016] shadow-lg scale-105'
                                                        : 'text-gray-400 hover:text-white'
                                                        }`}
                                                >
                                                    {token === 'USDC' ? (
                                                        <img src="/usdclogo.png" className="w-4 h-4" alt="USDC" />
                                                    ) : (
                                                        <svg className="w-4 h-4 text-current" viewBox="0 0 32 32" fill="currentColor">
                                                            <path d="M15.925 23.96l-9.819-5.796L15.925 32l9.83-13.836-9.83 5.796zM16.075 0L6.255 16.332l9.82 5.806 9.82-5.806L16.075 0zm0 20.686l-8.48-5.013 8.48-14.103 8.486 14.103-8.486 5.013z" />
                                                        </svg>
                                                    )}
                                                    {token}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Inputs */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Recipient Address</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={recipient}
                                                    onChange={(e) => setRecipient(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-[#0A1016] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all font-mono"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Amount</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        required
                                                        step="0.000001"
                                                        min="0"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-[#0A1016] border border-gray-700 rounded-xl p-3 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all font-mono appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                                        {selectedToken}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <p className="text-[10px] text-gray-400">
                                                        Balance: {selectedToken === 'ETH'
                                                            ? (ethBalance ? Number(formatUnits(ethBalance.value, 18)).toFixed(4) : '0.00')
                                                            : (usdcBalance ? Number(formatUnits(usdcBalance.value, 6)).toFixed(2) : '0.00')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error Display */}
                                        {error && (
                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading || !recipient || !amount}
                                            className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] disabled:bg-gray-700 disabled:text-gray-500 text-[#0A1016] rounded-xl font-bold text-md transition-all shadow-lg hover:shadow-[#81D7B4]/20 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <HiOutlinePaperAirplane className="w-4 h-4 -rotate-45 mb-1" />
                                                    Send {amount ? `${amount} ${selectedToken}` : 'Assets'}
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

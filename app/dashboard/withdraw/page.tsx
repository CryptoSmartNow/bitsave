'use client';

import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import BitSaveABI from '../../abi/contractABI.js';
import { handleContractError } from '../../../lib/contractErrorHandler';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineWallet, HiOutlineArrowDownTray, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";

const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);
const LISK_CHAIN_ID = BigInt(1135);
const AVALANCHE_CHAIN_ID = BigInt(43114);

export default function WithdrawPage() {
  const [savingName, setSavingName] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const getContractAddress = (cid: number) => {
    const chainIdBig = BigInt(cid);
    if (chainIdBig === BASE_CHAIN_ID) return BASE_CONTRACT_ADDRESS;
    if (chainIdBig === CELO_CHAIN_ID) return CELO_CONTRACT_ADDRESS;
    if (chainIdBig === LISK_CHAIN_ID) return LISK_CONTRACT_ADDRESS;
    if (chainIdBig === AVALANCHE_CHAIN_ID) return AVALANCHE_CONTRACT_ADDRESS;
    return CELO_CONTRACT_ADDRESS;
  };

  const handleWithdraw = async () => {
    if (!savingName || !address || !isConnected) return;
    try {
      setIsWithdrawing(true);
      setError('');
      setSuccess('');

      const contractAddress = getContractAddress(chainId);
      const walletProvider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await walletProvider.getSigner();

      const mainContract = new ethers.Contract(contractAddress, BitSaveABI, signer);
      const tx = await mainContract.withdrawSaving(savingName);
      const receipt = await tx.wait();
      setSuccess(`Successfully withdrew from "${savingName}". Tx: ${receipt.hash}`);
      setSavingName('');
    } catch (error) {
      setError(`Withdrawal failed: ${handleContractError(error)}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4 xs:p-6"
      >
        <div className="max-w-md w-full mx-auto">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl xs:rounded-3xl shadow-2xl p-6 xs:p-8 text-center border border-white/20"
          >
            <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-[#81D7B4]/20 to-[#6BC7A0]/20 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-6">
              <HiOutlineWallet className="w-8 h-8 xs:w-10 xs:h-10 text-[#81D7B4]" />
            </div>
            <h2 className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-[#2D5A4A] to-[#81D7B4] bg-clip-text text-transparent mb-3 xs:mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 text-base xs:text-lg leading-relaxed">
              Please connect your wallet to access withdrawal features
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen p-4 xs:p-6 bg-gradient-to-br from-[#f8fffe] via-[#f0fffc] to-[#e8fffa]">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/10 to-[#6BC7A0]/10 rounded-2xl xs:rounded-3xl blur-3xl transform translate-y-8"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl xs:rounded-3xl shadow-2xl overflow-hidden border border-white/30">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] p-6 xs:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 xs:space-x-4"
                >
                  <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <HiOutlineArrowDownTray className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl xs:text-3xl font-bold text-white mb-1">Withdraw Savings</h1>
                    <p className="text-white/90 text-xs xs:text-sm">Access your saved funds securely</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Main content */}
            <div className="p-6 xs:p-8 space-y-6 xs:space-y-8">
              {/* Status messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl xs:rounded-2xl p-4 xs:p-6"
                  >
                    <div className="flex items-start space-x-3">
                      <HiOutlineExclamationTriangle className="w-5 h-5 xs:w-6 xs:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 font-medium text-sm xs:text-base">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl xs:rounded-2xl p-4 xs:p-6"
                  >
                    <div className="flex items-start space-x-3">
                      <HiOutlineCheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-green-800 font-medium text-sm xs:text-base">{success}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 xs:space-y-6"
              >
                <div className="relative">
                  <label htmlFor="saving-name" className="block text-sm font-bold text-gray-700 mb-2 xs:mb-3">
                    Savings Plan Name
                  </label>
                  <div className="relative">
                    <input
                      id="saving-name"
                      type="text"
                      value={savingName}
                      onChange={(e) => setSavingName(e.target.value)}
                      placeholder="Enter your savings plan name"
                      className="w-full px-4 xs:px-6 py-3 xs:py-4 text-base xs:text-lg border-2 border-gray-200 rounded-xl xs:rounded-2xl focus:ring-4 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] transition-all duration-300 bg-white/80 backdrop-blur-sm min-h-[48px] xs:min-h-[56px]"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck="false"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/5 to-[#6BC7A0]/5 rounded-xl xs:rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                {/* Withdraw button */}
                <motion.button
                  onClick={handleWithdraw}
                  disabled={!savingName || isWithdrawing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden disabled:cursor-not-allowed group min-h-[56px] xs:min-h-[60px] touch-manipulation rounded-2xl xs:rounded-3xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] transition-all duration-300 ${!savingName || isWithdrawing ? 'opacity-50' : 'opacity-100'}`}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-white font-bold py-3 xs:py-4 px-6 xs:px-8 rounded-2xl xs:rounded-3xl flex items-center justify-center space-x-2 xs:space-x-3 min-h-[56px] xs:min-h-[60px]">
                    {isWithdrawing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 xs:h-5 w-4 xs:w-5 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm xs:text-base">Processing Withdrawal...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineArrowDownTray className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
                        <span className="text-sm xs:text-base">Withdraw Savings</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>

              {/* Info card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-[#81D7B4]/10 to-[#6BC7A0]/10 rounded-xl xs:rounded-2xl p-4 xs:p-6 border border-white/50"
              >
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-[#81D7B4]/20 to-[#6BC7A0]/20 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0">
                    <HiOutlineCheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-[#81D7B4]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1 xs:mb-2 text-base xs:text-lg">Secure Withdrawal</h3>
                    <p className="text-gray-600 text-xs xs:text-sm leading-relaxed">
                      Enter the exact name of your savings plan to initiate a secure withdrawal. 
                      Your funds will be transferred directly to your connected wallet.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Bitcoin01Icon, BankIcon, Search01Icon, Copy01Icon } from "hugeicons-react";
import { PaymentModal } from '@chainrails/react';
import toast from 'react-hot-toast';
import { ONSWITCH_COUNTRIES, CountryData } from '@/app/bizswap/wc26/countries';

export interface UnifiedFiatModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string | number;
  sessionToken?: string | null;
  onSuccess: (txHashOrReference: string) => void;
  userId: string;
  project: 'wc26' | 'bizfi' | 'bizswap';
  destinationWallet?: string;
  shares?: number;
  itemDescription?: string;
}

export function UnifiedFiatModal({
  isOpen,
  onClose,
  amount,
  sessionToken,
  onSuccess,
  userId,
  project,
  destinationWallet,
  shares,
  itemDescription = "your items"
}: UnifiedFiatModalProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'chainrails' | 'country' | 'kyc' | 'bank'>('method');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(ONSWITCH_COUNTRIES.find(c => c.code === 'NG')!);
  
  const [kycName, setKycName] = useState('');
  const [kycEmail, setKycEmail] = useState('');
  const [kycPhone, setKycPhone] = useState('');
  
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [onswitchReference, setOnswitchReference] = useState<string | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('method');
      setIsProcessing(false);
      setBankDetails(null);
      setOnswitchReference(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiatPayment = async () => {
    setIsProcessing(true);
    
    try {
      const payload: any = { 
        userId, 
        amount: parseFloat(amount.toString()),
        country: selectedCountry.code,
        currency: selectedCountry.currency,
        project,
      };

      if (shares) payload.shares = shares;
      if (destinationWallet) payload.destinationWallet = destinationWallet;

      if (kycName && kycEmail) {
        payload.payer = {
          name: kycName,
          email: kycEmail,
          phone: kycPhone
        };
      }

      const res = await fetch('/api/onswitch/onramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate fiat payment');
      }
      
      setBankDetails(data.depositDetails);
      setOnswitchReference(data.reference);
      setCurrentStep('bank');
    } catch (err: any) {
      toast.error(err.message || 'Error initiating fiat payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // 1. Method Selection
  if (currentStep === 'method') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-[#0A1019]/90 border border-[#D4AF37]/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(212,175,55,0.1)] relative backdrop-blur-xl">
          <h3 className="text-2xl font-display font-bold text-white mb-2">Select Payment Method</h3>
          <p className="text-gray-400 mb-8">Choose how you want to pay for {itemDescription}.</p>

          <div className="space-y-4">
            <button
              onClick={() => {
                if (!sessionToken) {
                  toast.error("Crypto payment session not initialized");
                  return;
                }
                setCurrentStep('chainrails');
              }}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all group flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <Bitcoin01Icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg group-hover:text-[#D4AF37] transition-colors">Pay with Crypto</h4>
                <p className="text-sm text-gray-400">Instant deposit via ChainRails</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentStep('country')}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#81D7B4]/50 hover:bg-white/10 transition-all group flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[#81D7B4]/20 flex items-center justify-center shrink-0">
                <BankIcon className="w-6 h-6 text-[#81D7B4]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg group-hover:text-[#81D7B4] transition-colors">Pay with Fiat</h4>
                <p className="text-sm text-gray-400">Bank Transfer Supported</p>
              </div>
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl border border-transparent text-gray-500 hover:text-white transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 2. Chainrails
  if (currentStep === 'chainrails' && sessionToken) {
    return (
      <PaymentModal
        isOpen={true}
        open={() => {}}
        close={onClose}
        onCancel={() => { setCurrentStep('method'); toast.error('Payment cancelled'); }}
        sessionToken={sessionToken}
        amount={amount.toString()}
        styles={{ theme: 'dark', accentColor: project === 'wc26' ? '#D4AF37' : '#81D7B4' }}
        onSuccess={(tx: any) => {
          toast.success("Payment successful!");
          onSuccess(tx?.hash || tx?.signature || "crypto_tx");
        }}
      />
    );
  }

  // 3. Country Selection
  if (currentStep === 'country') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-[#0A1019]/90 border border-[#81D7B4]/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-[0_0_40px_rgba(129,215,180,0.1)] relative backdrop-blur-xl flex flex-col max-h-[85vh]">
          <h3 className="text-2xl font-display font-bold text-white mb-2">Select Your Country</h3>
          <p className="text-gray-400 mb-6">Where are you transferring from?</p>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
              <Search01Icon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#020611] border border-[#1E2F45] rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#81D7B4]/50 focus:ring-2 focus:ring-[#81D7B4]/10 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[400px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#1E2F45] scrollbar-track-transparent">
            {ONSWITCH_COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.currency.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                  selectedCountry.code === country.code 
                    ? 'bg-[#81D7B4]/10 border-[#81D7B4]/50 text-white' 
                    : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium bg-[#020611] px-2 py-1 rounded-md">
                  {country.currency}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3 shrink-0">
            <button
              onClick={() => setCurrentStep('method')}
              className="flex-1 py-3 rounded-xl border border-[#1E2F45] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => { 
                if (selectedCountry.code === 'NG') {
                  handleFiatPayment();
                } else {
                  setCurrentStep('kyc');
                }
              }}
              className="flex-1 py-3 rounded-xl bg-[#81D7B4] text-black font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. KYC
  if (currentStep === 'kyc') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-[#0A1019]/90 border border-[#81D7B4]/30 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-[0_0_40px_rgba(129,215,180,0.1)] relative backdrop-blur-xl">
          <h3 className="text-2xl font-display font-bold text-white mb-2">Banking Compliance</h3>
          <p className="text-gray-400 mb-6 text-sm">To initiate a secure fiat transfer, Onswitch requires your verified contact details.</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={kycName}
                onChange={(e) => setKycName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#020611] border border-[#1E2F45] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#81D7B4]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={kycEmail}
                onChange={(e) => setKycEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full bg-[#020611] border border-[#1E2F45] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#81D7B4]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={kycPhone}
                onChange={(e) => setKycPhone(e.target.value)}
                placeholder="e.g. +44 7911 123456"
                className="w-full bg-[#020611] border border-[#1E2F45] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#81D7B4]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => setCurrentStep('country')}
              className="flex-1 py-3 rounded-xl border border-[#1E2F45] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleFiatPayment}
              disabled={isProcessing || !kycName || !kycEmail || !kycPhone}
              className="flex-1 py-3 rounded-xl bg-[#81D7B4] text-black font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'View Bank Details'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Bank Details
  if (currentStep === 'bank' && bankDetails) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-[#0A1019]/90 border border-[#81D7B4]/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(129,215,180,0.1)] relative backdrop-blur-xl">
          <h3 className="text-2xl font-display font-bold text-white mb-2">Bank Transfer</h3>
          <p className="text-gray-400 mb-6">Transfer the exact amount below. Your payment will be credited once received.</p>

          <div className="bg-[#020611] rounded-2xl p-5 border border-[#1E2F45] space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Bank Name</p>
              <p className="text-white font-semibold">{bankDetails.bank_name}</p>
            </div>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Account Number</p>
                <p className="text-xl font-bold text-[#81D7B4] tracking-wider">{bankDetails.account_number}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(bankDetails.account_number)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Copy01Icon className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Account Name</p>
              <p className="text-white font-semibold">{bankDetails.account_name}</p>
            </div>

            <div className="h-px w-full bg-[#1E2F45]" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Amount to Send</p>
                <p className="text-2xl font-black text-white">{selectedCountry?.symbol}{bankDetails.amount.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(bankDetails.amount.toString())}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Copy01Icon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl p-3">
            <p className="text-xs text-[#FF6B6B] font-medium text-center">
              Send exactly {selectedCountry?.symbol}{bankDetails.amount.toLocaleString()} or the transaction will fail.
            </p>
          </div>

          <button
            onClick={() => {
              toast.success('We will credit your account once the transfer is confirmed!');
              if (onswitchReference) {
                onSuccess(onswitchReference);
              }
              onClose();
            }}
            className="mt-6 w-full py-4 rounded-xl bg-[#81D7B4] text-black font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            I have paid
          </button>
        </div>
      </div>
    );
  }

  return null;
}

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
  onPending?: () => void;
  userId: string;
  project: 'wc26' | 'bizfi' | 'bizswap';
  destinationWallet?: string;
  shares?: number;
  itemDescription?: string;
  metadata?: any;
}

export function UnifiedFiatModal({
  isOpen,
  onClose,
  amount,
  sessionToken,
  onSuccess,
  onPending,
  userId,
  project,
  destinationWallet,
  shares,
  itemDescription = "your items",
  metadata
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
      if (metadata) payload.metadata = metadata;

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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-[50px] pointer-events-none"></div>

          <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight mb-2 relative z-10">Select Payment Method</h3>
          <p className="text-xs sm:text-sm text-[#7B8B9A] font-medium mb-6 sm:mb-8 relative z-10">Choose how you want to pay for {itemDescription}.</p>

          <div className="space-y-3 sm:space-y-4 relative z-10">
            <button
              onClick={() => {
                if (!sessionToken) {
                  toast.error("Crypto payment session not initialized");
                  return;
                }
                setCurrentStep('chainrails');
              }}
              className="w-full p-4 sm:p-5 rounded-2xl bg-[#0A0F17] border border-[#1C2538] hover:border-[#81D7B4]/50 hover:bg-[#121A27] transition-all group flex items-center gap-4 text-left shadow-inner"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center shrink-0 border border-[#81D7B4]/20 shadow-[inset_0_0_15px_rgba(129,215,180,0.1)] group-hover:scale-105 transition-transform">
                <Bitcoin01Icon className="w-6 h-6 text-[#81D7B4]" />
              </div>
              <div>
                <h4 className="text-[#F9F9FB] font-black text-base sm:text-lg tracking-tight group-hover:text-[#81D7B4] transition-colors">Pay with Crypto</h4>
                <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mt-1">Instant deposit via ChainRails</p>
              </div>
            </button>

            <button
              onClick={() => setCurrentStep('country')}
              className="w-full p-4 sm:p-5 rounded-2xl bg-[#0A0F17] border border-[#1C2538] hover:border-[#3B82F6]/50 hover:bg-[#121A27] transition-all group flex items-center gap-4 text-left shadow-inner"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center shrink-0 border border-[#3B82F6]/20 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)] group-hover:scale-105 transition-transform">
                <BankIcon className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <div>
                <h4 className="text-[#F9F9FB] font-black text-base sm:text-lg tracking-tight group-hover:text-[#3B82F6] transition-colors">Pay with Fiat</h4>
                <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mt-1">Bank Transfer Supported</p>
              </div>
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 sm:py-3 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors font-bold text-xs sm:text-sm relative z-10"
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
        closeOnOutsideClick={false}
      />
    );
  }

  // 3. Country Selection
  if (currentStep === 'country') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#3B82F6]/10 rounded-full blur-[50px] pointer-events-none"></div>

          <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight mb-2 relative z-10">Select Your Country</h3>
          <p className="text-xs sm:text-sm text-[#7B8B9A] font-medium mb-6 relative z-10">Where are you transferring from?</p>

          <div className="relative mb-5 z-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#7B8B9A]">
              <Search01Icon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#3B82F6]/50 shadow-inner transition-all placeholder:text-[#2C3E5D]"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[400px] pr-2 space-y-2 z-10 custom-scrollbar">
            {ONSWITCH_COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.currency.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between transition-all ${
                  selectedCountry.code === country.code 
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6]/50 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)] scale-[1.02]' 
                    : 'bg-[#0A0F17] border-[#1C2538] hover:border-[#2C3E5D] hover:bg-[#121A27]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-md">{country.flag}</span>
                  <span className={`font-black tracking-tight ${selectedCountry.code === country.code ? 'text-[#3B82F6]' : 'text-[#F9F9FB]'}`}>{country.name}</span>
                </div>
                <div className="text-[10px] font-black tracking-widest uppercase bg-[#121A27] text-[#7B8B9A] px-2.5 py-1 rounded-md border border-[#1C2538]">
                  {country.currency}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3 shrink-0 z-10">
            <button
              onClick={() => setCurrentStep('method')}
              className="flex-1 py-3.5 rounded-xl border border-[#1C2538] bg-[#0A0F17] text-[#7B8B9A] hover:text-[#F9F9FB] hover:border-[#2C3E5D] transition-colors font-bold text-sm"
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
              className="flex-1 py-3.5 rounded-xl bg-[#3B82F6] text-[#F9F9FB] font-black text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-[50px] pointer-events-none"></div>

          <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight mb-2 relative z-10">Banking Compliance</h3>
          <p className="text-xs sm:text-sm text-[#7B8B9A] font-medium mb-6 relative z-10 leading-relaxed">To initiate a secure fiat transfer, Onswitch requires your verified contact details.</p>

          <div className="space-y-4 sm:space-y-5 mb-8 relative z-10">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7B8B9A] mb-2">Full Name</label>
              <input
                type="text"
                value={kycName}
                onChange={(e) => setKycName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl sm:rounded-2xl py-3 px-4 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4]/50 shadow-inner transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7B8B9A] mb-2">Email Address</label>
              <input
                type="email"
                value={kycEmail}
                onChange={(e) => setKycEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl sm:rounded-2xl py-3 px-4 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4]/50 shadow-inner transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7B8B9A] mb-2">Phone Number</label>
              <input
                type="tel"
                value={kycPhone}
                onChange={(e) => setKycPhone(e.target.value)}
                placeholder="e.g. +44 7911 123456"
                className="w-full bg-[#0A0F17] border border-[#1C2538] rounded-xl sm:rounded-2xl py-3 px-4 text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4]/50 shadow-inner transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
          </div>

          <div className="flex gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setCurrentStep('country')}
              className="flex-1 py-3.5 rounded-xl border border-[#1C2538] bg-[#0A0F17] text-[#7B8B9A] hover:text-[#F9F9FB] hover:border-[#2C3E5D] transition-colors font-bold text-sm"
            >
              Back
            </button>
            <button
              onClick={handleFiatPayment}
              disabled={isProcessing || !kycName || !kycEmail || !kycPhone}
              className="flex-1 py-3.5 rounded-xl bg-[#81D7B4] text-[#080E18] font-black text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(129,215,180,0.3)]"
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0F17]/90 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#121A27] to-[#0A0F17] border border-[#1C2538] rounded-3xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-50"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-[50px] pointer-events-none"></div>

          <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight mb-2 relative z-10">Bank Transfer</h3>
          <p className="text-xs sm:text-sm text-[#7B8B9A] font-medium mb-6 relative z-10 leading-relaxed">Transfer the exact amount below. Your payment will be credited once received.</p>

          <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1C2538] space-y-4 shadow-inner relative z-10">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-1">Bank Name</p>
              <p className="text-[#F9F9FB] font-black">{bankDetails.bank_name}</p>
            </div>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-1">Account Number</p>
                <p className="text-xl sm:text-2xl font-black text-[#81D7B4] tracking-tight drop-shadow-[0_0_10px_rgba(129,215,180,0.2)]">{bankDetails.account_number}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(bankDetails.account_number)}
                className="p-2 sm:p-3 rounded-xl bg-[#121A27] border border-[#1C2538] text-[#7B8B9A] hover:text-[#81D7B4] hover:border-[#81D7B4]/30 transition-all active:scale-95"
              >
                <Copy01Icon className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-1">Account Name</p>
              <p className="text-[#F9F9FB] font-black">{bankDetails.account_name}</p>
            </div>

            <div className="h-px w-full bg-[#1C2538]" />

            <div className="flex justify-between items-center group">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-[#7B8B9A] uppercase tracking-widest mb-1">Amount to Send</p>
                <p className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">{selectedCountry?.symbol}{bankDetails.amount.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => copyToClipboard(bankDetails.amount.toString())}
                className="p-2 sm:p-3 rounded-xl bg-[#121A27] border border-[#1C2538] text-[#7B8B9A] hover:text-[#81D7B4] hover:border-[#81D7B4]/30 transition-all active:scale-95"
              >
                <Copy01Icon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-xl p-4 relative z-10">
            <p className="text-[10px] sm:text-xs text-[#FF6B6B] font-bold tracking-wide text-center uppercase">
              Send exactly {selectedCountry?.symbol}{bankDetails.amount.toLocaleString()} or the transaction will fail.
            </p>
          </div>

          <button
            onClick={() => {
              if (onPending) {
                onPending();
              } else {
                toast.success('Your fiat payment is pending. We will issue your certificate once the bank transfer clears!');
                onClose();
              }
            }}
            className="mt-6 w-full py-3.5 sm:py-4 rounded-xl bg-[#81D7B4] text-[#080E18] font-black text-sm sm:text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(129,215,180,0.3)] relative z-10"
          >
            I have paid
          </button>
        </div>
      </div>
    );
  }

  return null;
}

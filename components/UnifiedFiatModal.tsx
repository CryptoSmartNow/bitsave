'use client';

import React, { useState, useEffect } from 'react';
import {
  Bitcoin01Icon,
  BankIcon,
  Search01Icon,
  Copy01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  SecurityCheckIcon,
} from "hugeicons-react";
import { PaymentModal } from '@chainrails/react';
import toast from 'react-hot-toast';
import { ONSWITCH_COUNTRIES, CountryData } from '@/lib/countries';

export interface UnifiedFiatModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string | number;
  sessionToken?: string | null;
  onSuccess: (txHashOrReference: string) => void;
  onPending?: () => void;
  userId: string;
  project: 'bizfi' | 'bizswap';
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('method');
      setIsProcessing(false);
      setBankDetails(null);
      setOnswitchReference(null);
      setCopiedField(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, field?: string) => {
    navigator.clipboard.writeText(text);
    if (field) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
    toast.success('Copied to clipboard');
  };

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

  if (!isOpen) return null;

  // 1. Method Selection
  if (currentStep === 'method') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
        <div className="bg-[#0B111C]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-5 sm:p-7 w-full max-w-[460px] relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Tangible Grain Texture Overlay */}
          <div className="absolute inset-0 grain-texture pointer-events-none z-0" />

          {/* Modal Header */}
          <div className="flex items-start justify-between mb-5 relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Select <span className="font-instrument italic font-normal text-[#81D7B4]">Payment Method</span>
              </h3>
              <p className="text-xs text-[#7B8B9A] font-medium mt-1">
                Choose how you want to complete this transaction.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#121A27] transition-all border border-transparent hover:border-[#1E293B] shrink-0 -mr-1 -mt-1"
              title="Close"
            >
              <Cancel01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Order Summary Card */}
          <div className="bg-[#070A0F]/90 border border-[#162032] rounded-2xl p-4 mb-5 flex items-center justify-between gap-4 relative z-10 shadow-inner">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">Total Amount</span>
              <span className="text-2xl sm:text-3xl font-normal text-[#81D7B4] tracking-tight font-instrument">
                ${parseFloat(amount.toString()).toFixed(2)}
              </span>
            </div>
            <div className="text-right min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-0.5">Selected Asset</span>
              <span className="text-xs sm:text-sm font-bold text-[#F9F9FB] leading-snug break-words">
                {itemDescription}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 relative z-10">
            {/* Pay with Crypto */}
            <button
              type="button"
              onClick={() => {
                if (!sessionToken) {
                  toast.error("Crypto payment session not initialized");
                  return;
                }
                setCurrentStep('chainrails');
              }}
              className="w-full p-4 sm:p-4.5 rounded-2xl bg-[#070A0F]/80 border border-[#162032] hover:border-[#81D7B4]/70 hover:bg-[#111A2B]/70 transition-all duration-300 group flex items-center justify-between text-left shadow-sm hover:shadow-[0_0_20px_rgba(129,215,180,0.15)] hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#81D7B4]/10 border border-[#81D7B4]/20 flex items-center justify-center shrink-0 text-[#81D7B4] shadow-[0_0_12px_rgba(129,215,180,0.1)] group-hover:scale-105 transition-transform">
                  <Bitcoin01Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#F9F9FB] font-black text-sm sm:text-base tracking-tight group-hover:text-[#81D7B4] transition-colors">
                    Pay with Crypto
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#64748B] font-medium mt-0.5 leading-snug">
                    USDC, ETH, SOL &middot; Instant confirmation
                  </p>
                </div>
              </div>
              <ArrowRight01Icon className="w-4 h-4 text-[#64748B] group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* Pay with Fiat */}
            <button
              type="button"
              onClick={() => setCurrentStep('country')}
              className="w-full p-4 sm:p-4.5 rounded-2xl bg-[#070A0F]/80 border border-[#162032] hover:border-[#3B82F6]/70 hover:bg-[#111A2B]/70 transition-all duration-300 group flex items-center justify-between text-left shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 text-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.1)] group-hover:scale-105 transition-transform">
                  <BankIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[#F9F9FB] font-black text-sm sm:text-base tracking-tight group-hover:text-[#3B82F6] transition-colors">
                    Pay with Fiat
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#64748B] font-medium mt-0.5 leading-snug">
                    Direct bank transfer &middot; Virtual accounts
                  </p>
                </div>
              </div>
              <ArrowRight01Icon className="w-4 h-4 text-[#64748B] group-hover:text-[#3B82F6] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>

          {/* Security Assurance */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-[#64748B] font-medium relative z-10">
            <SecurityCheckIcon className="w-3.5 h-3.5 text-[#81D7B4]" />
            <span>256-Bit Encrypted & Audited Settlement</span>
          </div>

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
        styles={{ theme: 'dark', accentColor: project === 'bizfi' ? '#3B82F6' : '#81D7B4' }}
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
    const filteredCountries = ONSWITCH_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currency.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
        <div className="bg-[#0B111C]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-5 sm:p-7 w-full max-w-[460px] relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
          
          <div className="absolute inset-0 grain-texture pointer-events-none z-0" />

          {/* Modal Header */}
          <div className="flex items-start justify-between mb-4 relative z-10 shrink-0">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Select <span className="font-instrument italic font-normal text-[#60A5FA]">Your Country</span>
              </h3>
              <p className="text-xs text-[#7B8B9A] font-medium mt-1">
                Where are you transferring from?
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#121A27] transition-all border border-transparent hover:border-[#1E293B] shrink-0 -mr-1 -mt-1"
              title="Close"
            >
              <Cancel01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-3.5 z-10 shrink-0">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Search01Icon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by country or currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070A0F]/90 border border-[#162032] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#3B82F6] transition-all placeholder:text-[#2C3E5D]"
            />
          </div>

          {/* Countries List */}
          <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1 space-y-2 z-10 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#64748B] font-bold">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const active = selectedCountry.code === country.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                      active
                        ? 'bg-[#3B82F6]/15 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-[#070A0F]/80 border-[#162032] hover:border-[#2C3E5D] hover:bg-[#121A27]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none drop-shadow">{country.flag}</span>
                      <span className={`text-xs sm:text-sm font-black tracking-tight ${active ? 'text-[#F9F9FB]' : 'text-[#8DA2B5]'}`}>
                        {country.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                      active ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40' : 'bg-[#121A27] text-[#64748B] border-[#1E293B]'
                    }`}>
                      {country.currency}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex gap-2.5 shrink-0 z-10">
            <button
              onClick={() => setCurrentStep('method')}
              className="flex-1 py-3 rounded-xl border border-[#162032] bg-[#070A0F] text-[#8DA2B5] hover:text-[#F9F9FB] hover:border-[#2C3E5D] transition-colors font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => { 
                if (selectedCountry.code === 'NG') {
                  handleFiatPayment();
                } else {
                  setCurrentStep('kyc');
                }
              }}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl bg-[#3B82F6] text-white font-black text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Connecting...' : 'Continue'}</span>
              {!isProcessing && <ArrowRight01Icon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 4. KYC
  if (currentStep === 'kyc') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
        <div className="bg-[#0B111C]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-5 sm:p-7 w-full max-w-[460px] relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
          
          <div className="absolute inset-0 grain-texture pointer-events-none z-0" />

          {/* Modal Header */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Banking <span className="font-instrument italic font-normal text-[#81D7B4]">Compliance</span>
              </h3>
              <p className="text-xs text-[#7B8B9A] font-medium mt-1 leading-relaxed">
                Provide your details to generate your verified virtual deposit account.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#121A27] transition-all border border-transparent hover:border-[#1E293B] shrink-0 -mr-1 -mt-1"
              title="Close"
            >
              <Cancel01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Input Fields */}
          <div className="space-y-3.5 mb-6 relative z-10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={kycName}
                onChange={(e) => setKycName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full bg-[#070A0F]/90 border border-[#162032] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={kycEmail}
                onChange={(e) => setKycEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full bg-[#070A0F]/90 border border-[#162032] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7B8B9A] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={kycPhone}
                onChange={(e) => setKycPhone(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="w-full bg-[#070A0F]/90 border border-[#162032] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-[#F9F9FB] outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#2C3E5D]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => setCurrentStep('country')}
              className="flex-1 py-3 rounded-xl border border-[#162032] bg-[#070A0F] text-[#8DA2B5] hover:text-[#F9F9FB] hover:border-[#2C3E5D] transition-colors font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFiatPayment}
              disabled={isProcessing || !kycName || !kycEmail || !kycPhone}
              className="flex-1 py-3 rounded-xl bg-[#81D7B4] text-[#070A0F] font-black text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(129,215,180,0.25)] flex items-center justify-center gap-1.5"
            >
              <span>{isProcessing ? 'Generating...' : 'View Bank Details'}</span>
              {!isProcessing && <ArrowRight01Icon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 5. Bank Details
  if (currentStep === 'bank' && bankDetails) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-md">
        <div className="bg-[#0B111C]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-5 sm:p-7 w-full max-w-[480px] relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
          
          <div className="absolute inset-0 grain-texture pointer-events-none z-0" />

          {/* Header */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
                Bank Transfer <span className="font-instrument italic font-normal text-[#81D7B4]">Details</span>
              </h3>
              <p className="text-xs text-[#7B8B9A] font-medium mt-1">
                Transfer the exact amount below to complete your order.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#121A27] transition-all border border-transparent hover:border-[#1E293B] shrink-0 -mr-1 -mt-1"
              title="Close"
            >
              <Cancel01Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Bank Details Spec Card */}
          <div className="bg-[#070A0F]/90 rounded-2xl p-4 sm:p-5 border border-[#162032] space-y-3.5 relative z-10 shadow-inner">
            
            {/* Bank Name */}
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Bank Name</p>
              <p className="text-[#F9F9FB] font-black text-sm sm:text-base break-words">{bankDetails.bank_name}</p>
            </div>

            {/* Account Number with Copy button */}
            <div className="flex justify-between items-center bg-[#0B111C] p-3 rounded-xl border border-[#182338]">
              <div>
                <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Account Number</p>
                <p className="text-2xl sm:text-3xl font-normal text-[#81D7B4] tracking-tight break-all font-mono">
                  {bankDetails.account_number}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => copyToClipboard(bankDetails.account_number, 'account')}
                className={`px-3 py-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                  copiedField === 'account'
                    ? 'bg-[#81D7B4]/20 border-[#81D7B4] text-[#81D7B4]'
                    : 'bg-[#121A27] border-[#1C2538] text-[#7B8B9A] hover:text-[#81D7B4] hover:border-[#81D7B4]/40'
                }`}
                title="Copy Account Number"
              >
                {copiedField === 'account' ? (
                  <CheckmarkCircle01Icon className="w-4 h-4 text-[#81D7B4]" />
                ) : (
                  <Copy01Icon className="w-4 h-4" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">{copiedField === 'account' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Account Name */}
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Beneficiary / Account Name</p>
              <p className="text-[#F9F9FB] font-bold text-xs sm:text-sm break-words">{bankDetails.account_name}</p>
            </div>

            <div className="h-px w-full bg-[#162032]" />

            {/* Amount to Send with Copy button */}
            <div className="flex justify-between items-center bg-[#0B111C] p-3 rounded-xl border border-[#182338]">
              <div>
                <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Exact Amount to Send</p>
                <p className="text-2xl sm:text-3xl font-normal text-[#F9F9FB] tracking-tight font-instrument">
                  {selectedCountry?.symbol}{bankDetails.amount.toLocaleString()}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => copyToClipboard(bankDetails.amount.toString(), 'amount')}
                className={`px-3 py-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                  copiedField === 'amount'
                    ? 'bg-[#81D7B4]/20 border-[#81D7B4] text-[#81D7B4]'
                    : 'bg-[#121A27] border-[#1C2538] text-[#7B8B9A] hover:text-[#81D7B4] hover:border-[#81D7B4]/40'
                }`}
                title="Copy Amount"
              >
                {copiedField === 'amount' ? (
                  <CheckmarkCircle01Icon className="w-4 h-4 text-[#81D7B4]" />
                ) : (
                  <Copy01Icon className="w-4 h-4" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">{copiedField === 'amount' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Important Notice Box */}
          <div className="mt-3.5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 relative z-10">
            <InformationCircleIcon className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-[#FF8F8F] font-semibold leading-relaxed">
              Send exactly <span className="text-[#F9F9FB] font-bold underline underline-offset-2">{selectedCountry?.symbol}{bankDetails.amount.toLocaleString()}</span> to avoid processing delays or failed mints.
            </p>
          </div>

          {/* Submit CTA Button */}
          <button
            type="button"
            onClick={async () => {
              setIsSimulating(true);
              try {
                if (window.location.hostname === 'localhost' || window.location.hostname.includes('ngrok')) {
                  const res = await fetch('/api/bizswap/mock-pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference: onswitchReference || bankDetails?.reference })
                  });
                  if (res.ok) {
                    toast.success('Payment confirmed! Minting certificate...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    onSuccess(onswitchReference || bankDetails?.reference);
                    return;
                  }
                }
                
                if (onPending) {
                  onPending();
                } else {
                  toast.success('Your transfer is being confirmed. Certificate will be issued upon clearance.');
                  onClose();
                }
              } catch (e) {
                console.error("Simulation error", e);
                toast.error("Failed to process payment");
              } finally {
                setIsSimulating(false);
              }
            }}
            disabled={isSimulating}
            className="mt-4 w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#81D7B4] text-[#070A0F] font-black text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(129,215,180,0.25)] flex items-center justify-center gap-2 relative z-10"
          >
            {isSimulating ? 'Confirming Transfer...' : 'I Have Transferred the Funds'}
            {!isSimulating && <ArrowRight01Icon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

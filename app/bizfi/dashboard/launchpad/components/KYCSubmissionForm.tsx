'use client';

import { Tick01Icon, Activity01Icon, Money01Icon, Shield01Icon, InformationCircleIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface KYCSubmissionFormProps {
    business: any;
    onSuccess: () => void;
}

const InputField = ({ label, value, onChange, placeholder, required = false, type = "text", helpText }: any) => (
    <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-[#7B8B9A] uppercase tracking-wider">
            {label} {required && <span className="text-[#81D7B4]">*</span>}
        </label>
        <input 
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/20 focus:outline-none placeholder-[#7B8B9A]/40 text-xs font-medium transition-all"
        />
        {helpText && <p className="text-[11px] text-[#7B8B9A]">{helpText}</p>}
    </div>
);

const RadioOption = ({ label, value, checked, onChange, name }: any) => (
    <label className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
        checked 
            ? 'bg-[#81D7B4]/10 border-[#81D7B4]/50 text-[#F9F9FB]' 
            : 'bg-[#0F1825]/60 border-[#7B8B9A]/20 text-[#7B8B9A] hover:text-[#F9F9FB] hover:border-[#7B8B9A]/40'
    }`}>
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
            checked ? 'border-[#81D7B4] bg-[#81D7B4]' : 'border-[#7B8B9A]/40'
        }`}>
            {checked && <div className="w-1.5 h-1.5 rounded-full bg-[#0F1825]" />}
        </div>
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="hidden"
        />
        <span className="text-xs font-semibold">{label}</span>
    </label>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-start gap-2.5 cursor-pointer group select-none">
        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
            checked 
                ? 'border-[#81D7B4] bg-[#81D7B4] text-[#0F1825]' 
                : 'border-[#7B8B9A]/30 bg-[#0F1825] group-hover:border-[#81D7B4]/50'
        }`}>
            {checked && <Tick01Icon className="w-3 h-3 text-[#0F1825] stroke-[3]" />}
        </div>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="hidden"
        />
        <span className={`text-xs font-medium leading-relaxed ${checked ? 'text-[#F9F9FB]' : 'text-[#7B8B9A] group-hover:text-[#F9F9FB]/80'}`}>
            {label}
        </span>
    </label>
);

export default function KYCSubmissionForm({ business, onSuccess }: KYCSubmissionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        idType: 'nin',
        idNumber: '',
        idDocumentLink: '',
        selfieLink: '',
        isRegistered: 'no',
        registrationNumber: '',
        businessDocsLink: '',
        confirmShortTerm: false,
        confirmRepayment: false,
        confirmCommunication: false,
        contactChannel: 'whatsapp',
        payoutMethod: 'bank',
        payoutDetails: '',
        confirmAccuracy: false,
        consentVerification: false
    });

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const required = [
            'idNumber', 'idDocumentLink', 'selfieLink',
            'payoutDetails'
        ];
        
        for (const field of required) {
            // @ts-ignore
            if (!formData[field] || formData[field].trim() === '') return false;
        }
        
        if (formData.isRegistered === 'yes') {
            if (!formData.registrationNumber || !formData.businessDocsLink) return false;
        }

        if (!formData.confirmShortTerm || !formData.confirmRepayment || !formData.confirmCommunication || !formData.confirmAccuracy || !formData.consentVerification) {
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setError("Please complete all required fields, provide upload links, and acknowledge all checkboxes.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const updates = {
                "metadata.kyc": formData,
                "status": "under_review",
                "kycSteps": [
                    { id: 1, label: "Application", description: "Assessment recorded", icon: CheckmarkCircle02Icon },
                    { id: 2, label: "KYC/KYB Submitted", description: "Docs submitted", icon: Tick01Icon },
                    { id: 3, label: "Compliance Review", description: "Under manual audit", icon: Shield01Icon },
                    { id: 4, label: "BizShares Listing", description: "Onchain token pool", icon: Tick01Icon }
                ]
            };

            const response = await fetch('/api/bizfi/business', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionHash: business.transactionHash,
                    owner: business.owner,
                    updates
                })
            });

            if (!response.ok) throw new Error("Failed to submit KYC verification details.");

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
            
            {/* Form Title & Introduction */}
            <div className="pb-4 border-b border-[#7B8B9A]/15">
                <h3 className="text-lg sm:text-xl font-bold text-[#F9F9FB] flex items-center gap-2">
                    <Shield01Icon className="w-5 h-5 text-[#81D7B4]" />
                    Identity & Compliance Verification (KYC / KYB)
                </h3>
                <p className="text-xs text-[#7B8B9A] mt-1 font-medium">
                    Submit verification documents to verify your business footprint and activate investor discovery.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-5">
                    
                    {/* Identity Verification Section */}
                    <div className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#7B8B9A]/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F9F9FB] flex items-center gap-2">
                                <Activity01Icon className="w-4 h-4 text-[#81D7B4]" />
                                1. Personal Identity Verification
                            </h4>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-[#7B8B9A] mb-1.5">
                                National ID Type <span className="text-[#81D7B4]">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['nin', 'passport', 'voters_card', 'national_id'].map((type) => (
                                    <RadioOption
                                        key={type}
                                        name="idType"
                                        value={type}
                                        label={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        checked={formData.idType === type}
                                        onChange={(e: any) => updateFormData('idType', e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        <InputField 
                            label="ID Number (NIN / Passport / Card No.)" 
                            required 
                            placeholder="Enter official government ID number"
                            value={formData.idNumber}
                            onChange={(e: any) => updateFormData('idNumber', e.target.value)}
                        />

                        <InputField 
                            label="Upload ID Document (Google Drive / Cloud Link)" 
                            required 
                            placeholder="https://drive.google.com/file/d/..."
                            helpText="Provide a shareable Google Drive, Dropbox, or IPFS link (view permissions enabled)."
                            value={formData.idDocumentLink}
                            onChange={(e: any) => updateFormData('idDocumentLink', e.target.value)}
                        />
                        
                        <InputField 
                            label="Recent Photo or Live Selfie (Drive Link)" 
                            required 
                            placeholder="https://drive.google.com/file/d/..."
                            helpText="Clear photo showing founder holding valid identification or passport face page."
                            value={formData.selfieLink}
                            onChange={(e: any) => updateFormData('selfieLink', e.target.value)}
                        />
                    </div>

                    {/* Business Registration Section */}
                    <div className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                        <div className="pb-2.5 border-b border-[#7B8B9A]/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F9F9FB] flex items-center gap-2">
                                <Activity01Icon className="w-4 h-4 text-[#81D7B4]" />
                                2. Legal Business Registration (KYB)
                            </h4>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-[#7B8B9A] mb-1.5">
                                Is your business officially incorporated / registered?
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <RadioOption
                                    name="isRegistered"
                                    value="yes"
                                    label="Yes (Registered)"
                                    checked={formData.isRegistered === 'yes'}
                                    onChange={(e: any) => updateFormData('isRegistered', e.target.value)}
                                />
                                <RadioOption
                                    name="isRegistered"
                                    value="no"
                                    label="No (Informal / Early)"
                                    checked={formData.isRegistered === 'no'}
                                    onChange={(e: any) => updateFormData('isRegistered', e.target.value)}
                                />
                            </div>
                        </div>

                        {formData.isRegistered === 'yes' ? (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-3.5 pt-2 border-t border-[#7B8B9A]/10"
                            >
                                <InputField 
                                    label="Business Registration Number (RC / CAC / EIN / BN)" 
                                    required
                                    placeholder="e.g. RC-1928491"
                                    value={formData.registrationNumber}
                                    onChange={(e: any) => updateFormData('registrationNumber', e.target.value)}
                                />
                                <InputField 
                                    label="Certificate of Incorporation / Registration (Drive Link)" 
                                    required 
                                    placeholder="https://drive.google.com/file/d/..."
                                    helpText="Upload Certificate of Incorporation, CAC status report, or tax registration document."
                                    value={formData.businessDocsLink}
                                    onChange={(e: any) => updateFormData('businessDocsLink', e.target.value)}
                                />
                            </motion.div>
                        ) : (
                            <div className="p-3 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-xl flex items-start gap-2">
                                <InformationCircleIcon className="w-4 h-4 text-[#81D7B4] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#F9F9FB]/90 leading-relaxed">
                                    <strong className="text-[#81D7B4]">Unregistered businesses are welcomed:</strong> BizFi supports informal & early-stage ventures. You can verify identity without legal papers.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-5">
                    
                    {/* Contact & Payout Section */}
                    <div className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                        <div className="pb-2.5 border-b border-[#7B8B9A]/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F9F9FB] flex items-center gap-2">
                                <Money01Icon className="w-4 h-4 text-[#81D7B4]" />
                                3. Communication & Liquidity Routing
                            </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#7B8B9A] mb-1.5">
                                    Preferred Channel
                                </label>
                                <div className="space-y-1.5">
                                    <RadioOption
                                        name="contactChannel"
                                        value="whatsapp"
                                        label="WhatsApp"
                                        checked={formData.contactChannel === 'whatsapp'}
                                        onChange={(e: any) => updateFormData('contactChannel', e.target.value)}
                                    />
                                    <RadioOption
                                        name="contactChannel"
                                        value="email"
                                        label="Email"
                                        checked={formData.contactChannel === 'email'}
                                        onChange={(e: any) => updateFormData('contactChannel', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-[#7B8B9A] mb-1.5">
                                    Payout Method
                                </label>
                                <div className="space-y-1.5">
                                    <RadioOption
                                        name="payoutMethod"
                                        value="bank"
                                        label="Bank Transfer"
                                        checked={formData.payoutMethod === 'bank'}
                                        onChange={(e: any) => updateFormData('payoutMethod', e.target.value)}
                                    />
                                    <RadioOption
                                        name="payoutMethod"
                                        value="mobile_money"
                                        label="Mobile Money"
                                        checked={formData.payoutMethod === 'mobile_money'}
                                        onChange={(e: any) => updateFormData('payoutMethod', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <InputField 
                            label="Payout Settlement Details" 
                            required 
                            placeholder="Account Number & Bank Name (or Mobile Money Phone & Provider)"
                            helpText="Where liquidity grants or raised funds will be settled."
                            value={formData.payoutDetails}
                            onChange={(e: any) => updateFormData('payoutDetails', e.target.value)}
                        />
                    </div>

                    {/* Acknowledgements Section */}
                    <div className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                        <div className="pb-2.5 border-b border-[#7B8B9A]/10">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F9F9FB] flex items-center gap-2">
                                <Shield01Icon className="w-4 h-4 text-[#81D7B4]" />
                                4. Acknowledgements & Declaration
                            </h4>
                        </div>

                        <div className="space-y-2.5 bg-[#0F1825]/60 p-3.5 rounded-xl border border-[#7B8B9A]/15">
                            <Checkbox 
                                label="I understand protocol liquidity/loan programs operate with short-term structured milestones."
                                checked={formData.confirmShortTerm}
                                onChange={(e: any) => updateFormData('confirmShortTerm', e.target.checked)}
                            />
                            <Checkbox 
                                label="I agree to follow the disbursement and repayment terms agreed upon verification."
                                checked={formData.confirmRepayment}
                                onChange={(e: any) => updateFormData('confirmRepayment', e.target.checked)}
                            />
                            <Checkbox 
                                label="I agree to maintain active communications with BizFi advisors and compliance officers."
                                checked={formData.confirmCommunication}
                                onChange={(e: any) => updateFormData('confirmCommunication', e.target.checked)}
                            />
                        </div>

                        <div className="space-y-2.5 pt-1">
                            <Checkbox 
                                label="I confirm under penalty of perjury that all submitted documents and details are authentic."
                                checked={formData.confirmAccuracy}
                                onChange={(e: any) => updateFormData('confirmAccuracy', e.target.checked)}
                            />
                            <Checkbox 
                                label="I authorize BizFi Protocol to conduct regulatory compliance and automated onchain risk assessments."
                                checked={formData.consentVerification}
                                onChange={(e: any) => updateFormData('consentVerification', e.target.checked)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/25">
                    <InformationCircleIcon className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-semibold">{error}</p>
                </div>
            )}

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#7B8B9A]/15">
                <p className="text-xs text-[#7B8B9A]">
                    Applications enter the verification queue upon submission.
                </p>
                
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
                >
                    {loading ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
                            <span>Submitting Verification...</span>
                        </>
                    ) : (
                        <>
                            <Tick01Icon className="w-3.5 h-3.5 text-[#0F1825] stroke-[3]" />
                            <span>Submit Verification Application</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

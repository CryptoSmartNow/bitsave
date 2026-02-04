"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
    HiOutlineCheckCircle, 
    HiOutlineCloudArrowUp,
    HiOutlineIdentification,
    HiOutlineBuildingOffice2,
    HiOutlineChatBubbleLeftRight,
    HiOutlineBanknotes,
    HiOutlineShieldCheck,
    HiOutlineExclamationCircle
} from "react-icons/hi2";

interface KYCSubmissionFormProps {
    business: any;
    onSuccess: () => void;
}

const InputField = ({ label, required = false, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            {label} {required && <span className="text-[#81D7B4]">*</span>}
        </label>
        <input
            {...props}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none placeholder-gray-500"
        />
    </div>
);

const RadioOption = ({ label, value, checked, onChange, name }: any) => (
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'border-[#81D7B4] bg-[#81D7B4]/10' : 'border-gray-600 group-hover:border-gray-500'}`}>
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4]" />}
        </div>
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="hidden"
        />
        <span className={`${checked ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
    </label>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-start gap-3 cursor-pointer group">
        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${checked ? 'border-[#81D7B4] bg-[#81D7B4]' : 'border-gray-600 group-hover:border-gray-500'}`}>
            {checked && <HiOutlineCheckCircle className="w-4 h-4 text-gray-900" />}
        </div>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="hidden"
        />
        <span className={`text-sm ${checked ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
    </label>
);

export default function KYCSubmissionForm({ business, onSuccess }: KYCSubmissionFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        // Identity
        idType: 'nin',
        idNumber: '',
        idDocumentLink: '',
        selfieLink: '',
        
        // Business Registration
        isRegistered: 'no',
        registrationNumber: '',
        businessDocsLink: '',
        
        // Checkboxes
        confirmShortTerm: false,
        confirmRepayment: false,
        confirmCommunication: false,
        
        // Contact
        contactChannel: 'whatsapp',
        
        // Payout
        payoutMethod: 'bank',
        payoutDetails: '',
        
        // Declaration
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
            setError("Please fill in all required fields and accept all confirmations.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const updates = {
                "metadata.kyc": formData,
                "status": "under_review", // Move to review state
                "kycSteps": [
                    { id: 1, label: "Submission", description: "Details submitted", icon: HiOutlineCheckCircle },
                    { id: 2, label: "Review", description: "Under manual review", icon: HiOutlineShieldCheck },
                    { id: 3, label: "Approval", description: "Verification complete", icon: HiOutlineCheckCircle }
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

            if (!response.ok) throw new Error("Failed to submit KYC details");

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HiOutlineShieldCheck className="w-6 h-6 text-[#81D7B4]" />
                        KYC/KYB Verification
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Complete verification to unlock full dashboard features.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* LEFT COLUMN */}
                <div className="space-y-8">
                    {/* Identity Verification */}
                    <section className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <HiOutlineIdentification className="w-5 h-5 text-[#81D7B4]" />
                            Identity Verification <span className="text-xs text-[#81D7B4] border border-[#81D7B4]/30 px-2 py-0.5 rounded">Required</span>
                        </h4>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">National ID Type</label>
                            <div className="grid grid-cols-2 gap-3">
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
                            label="ID Number (NIN/Passport No.)" 
                            required 
                            value={formData.idNumber}
                            onChange={(e: any) => updateFormData('idNumber', e.target.value)}
                        />

                        <InputField 
                            label="Upload ID Document (Drive Link)" 
                            required 
                            placeholder="https://drive.google.com/..."
                            value={formData.idDocumentLink}
                            onChange={(e: any) => updateFormData('idDocumentLink', e.target.value)}
                        />
                        
                        <InputField 
                            label="Live Selfie / Recent Photo (Drive Link)" 
                            required 
                            placeholder="https://drive.google.com/..."
                            value={formData.selfieLink}
                            onChange={(e: any) => updateFormData('selfieLink', e.target.value)}
                        />
                    </section>

                    {/* Business Registration */}
                    <section className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <HiOutlineBuildingOffice2 className="w-5 h-5 text-[#81D7B4]" />
                            Business Registration
                        </h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Is the business registered?</label>
                            <div className="flex gap-6">
                                <RadioOption
                                    name="isRegistered"
                                    value="yes"
                                    label="Yes"
                                    checked={formData.isRegistered === 'yes'}
                                    onChange={(e: any) => updateFormData('isRegistered', e.target.value)}
                                />
                                <RadioOption
                                    name="isRegistered"
                                    value="no"
                                    label="No"
                                    checked={formData.isRegistered === 'no'}
                                    onChange={(e: any) => updateFormData('isRegistered', e.target.value)}
                                />
                            </div>
                        </div>

                        {formData.isRegistered === 'yes' ? (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 pl-4 border-l-2 border-[#81D7B4]/30"
                            >
                                <InputField 
                                    label="Business Registration Number" 
                                    required
                                    value={formData.registrationNumber}
                                    onChange={(e: any) => updateFormData('registrationNumber', e.target.value)}
                                />
                                <div>
                                    <InputField 
                                        label="Upload Registration Document (Drive Link)" 
                                        required 
                                        placeholder="https://drive.google.com/..."
                                        value={formData.businessDocsLink}
                                        onChange={(e: any) => updateFormData('businessDocsLink', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Please provide a Google Drive link to keep the upload lightweight.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-blue-200">
                                    <span className="font-bold">Note:</span> No business is rejected for being unregistered. You can proceed without registration documents.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                     {/* Confirmations */}
                     <section className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />
                            Acknowledgements
                        </h4>
                        <div className="space-y-3 bg-gray-800/30 p-4 rounded-xl">
                            <Checkbox 
                                label="I understand this is a short-term loan"
                                checked={formData.confirmShortTerm}
                                onChange={(e: any) => updateFormData('confirmShortTerm', e.target.checked)}
                            />
                            <Checkbox 
                                label="I agree to follow the repayment schedule"
                                checked={formData.confirmRepayment}
                                onChange={(e: any) => updateFormData('confirmRepayment', e.target.checked)}
                            />
                            <Checkbox 
                                label="I will communicate early if I face challenges"
                                checked={formData.confirmCommunication}
                                onChange={(e: any) => updateFormData('confirmCommunication', e.target.checked)}
                            />
                        </div>
                    </section>

                    {/* Contact & Payout */}
                    <section className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-[#81D7B4]" />
                            Contact & Payout
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Contact</label>
                                <div className="space-y-2">
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Payout Method</label>
                                <div className="space-y-2">
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
                            label="Payout Details (Account Number / Phone Number)" 
                            required 
                            placeholder="e.g. 0123456789 - GTBank"
                            value={formData.payoutDetails}
                            onChange={(e: any) => updateFormData('payoutDetails', e.target.value)}
                        />
                    </section>

                    {/* Declaration */}
                    <section className="space-y-4">
                        <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                            <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />
                            Declaration
                        </h4>
                        <div className="space-y-3">
                            <Checkbox 
                                label="I confirm the information provided is accurate"
                                checked={formData.confirmAccuracy}
                                onChange={(e: any) => updateFormData('confirmAccuracy', e.target.checked)}
                            />
                            <Checkbox 
                                label="I consent to basic verification checks"
                                checked={formData.consentVerification}
                                onChange={(e: any) => updateFormData('consentVerification', e.target.checked)}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-xl hover:bg-[#6BC4A0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Verification
                            <HiOutlineCheckCircle className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
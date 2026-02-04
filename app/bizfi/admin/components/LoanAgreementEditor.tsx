import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Eye, Save } from 'lucide-react';
import { format } from 'date-fns';

interface LoanAgreementEditorProps {
  business: {
    businessName: string;
    owner: string;
    transactionHash: string;
  };
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function LoanAgreementEditor({ business, onClose, onSave }: LoanAgreementEditorProps) {
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [formData, setFormData] = useState({
    borrowerName: business.owner || '',
    borrowerAddress: '',
    principalSum: '',
    tenor: '',
    interestRate: '',
    repaymentSchedule: '',
    commencementDate: format(new Date(), 'yyyy-MM-dd'),
    witnessName: '',
    witnessAddress: '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save agreement', error);
    } finally {
      setSaving(false);
    }
  };

  const Letterhead = () => (
    <div className="text-center mb-8 border-b-2 border-[#81D7B4] pb-6">
      <h1 className="text-3xl font-bold text-[#0F1825] uppercase tracking-wide mb-2">Bitsave Smart Limited</h1>
      <div className="text-sm text-gray-600 font-medium space-y-1">
        <p>6, Nwosu Street, Atali Off Tank, Port Harcourt, Rivers State</p>
        <p>RC Number: 1806323</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1825]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A2538] w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#7B8B9A]/10"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#F9F9FB]">
              {step === 'edit' ? 'Edit Loan Agreement' : 'Preview Agreement'}
            </h2>
            <span className="px-2 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold rounded-md uppercase border border-[#81D7B4]/20">
              {business.businessName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {step === 'edit' ? (
              <button
                onClick={() => setStep('preview')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F1825] text-[#F9F9FB] rounded-lg text-sm font-medium hover:bg-[#253247] transition-colors border border-[#7B8B9A]/20"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            ) : (
              <button
                onClick={() => setStep('edit')}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F1825] text-[#F9F9FB] rounded-lg text-sm font-medium hover:bg-[#253247] transition-colors border border-[#7B8B9A]/20"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#7B8B9A]/10 rounded-lg text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0F1825]/30">
          {step === 'edit' ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-[#1A2538]/50 p-6 rounded-xl shadow-sm border border-[#7B8B9A]/10">
                <h3 className="text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-4">Borrower Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Borrower Name</label>
                    <input
                      type="text"
                      name="borrowerName"
                      value={formData.borrowerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Address</label>
                    <input
                      type="text"
                      name="borrowerAddress"
                      value={formData.borrowerAddress}
                      onChange={handleInputChange}
                      placeholder="Full Address"
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#7B8B9A]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1A2538]/50 p-6 rounded-xl shadow-sm border border-[#7B8B9A]/10">
                <h3 className="text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-4">Loan Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Principal Sum</label>
                    <input
                      type="text"
                      name="principalSum"
                      value={formData.principalSum}
                      onChange={handleInputChange}
                      placeholder="e.g. $5,000"
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#7B8B9A]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Tenor (Duration)</label>
                    <input
                      type="text"
                      name="tenor"
                      value={formData.tenor}
                      onChange={handleInputChange}
                      placeholder="e.g. 12 months"
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#7B8B9A]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Interest Rate</label>
                    <input
                      type="text"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      placeholder="e.g. 5%"
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#7B8B9A]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Commencement Date</label>
                    <input
                      type="date"
                      name="commencementDate"
                      value={formData.commencementDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#9BA8B5] mb-1">Repayment Schedule</label>
                    <textarea
                      name="repaymentSchedule"
                      value={formData.repaymentSchedule}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe how the loan will be repaid..."
                      className="w-full px-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-lg text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-all placeholder:text-[#7B8B9A]/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm min-h-full print:shadow-none">
              <Letterhead />
              
              <div className="space-y-6 text-[#0F1825] font-serif leading-relaxed">
                <h2 className="text-xl font-bold text-center uppercase underline decoration-[#81D7B4] decoration-2 underline-offset-4 mb-8">
                  Loan Agreement
                </h2>

                <p>
                  <strong>THIS LOAN AGREEMENT</strong> is made this <strong>{format(new Date(formData.commencementDate), 'do')} day of {format(new Date(formData.commencementDate), 'MMMM, yyyy')}</strong>.
                </p>

                <p>
                  <strong>BETWEEN:</strong>
                </p>

                <p>
                  <strong>BITSAVE SMART LIMITED</strong>, a company incorporated under the laws of the Federal Republic of Nigeria with RC Number 1806323 and having its registered office at 6, Nwosu Street, Atali Off Tank, Port Harcourt, Rivers State (hereinafter referred to as the "<strong>LENDER</strong>", which expression shall where the context so admits include its successors-in-title and assigns) of the ONE PART;
                </p>

                <p className="text-center font-bold">AND</p>

                <p>
                  <strong>{formData.borrowerName.toUpperCase()}</strong> of {formData.borrowerAddress || '[Insert Address]'} (hereinafter referred to as the "<strong>BORROWER</strong>", which expression shall where the context so admits include his/her heirs, personal representatives, and assigns) of the OTHER PART.
                </p>

                <p>
                  <strong>WHEREAS:</strong>
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>The Lender is in the business of providing financial services.</li>
                  <li>The Borrower has applied to the Lender for a loan facility.</li>
                  <li>The Lender has agreed to grant the loan to the Borrower upon the terms and conditions hereinafter appearing.</li>
                </ol>

                <p><strong>NOW IT IS HEREBY AGREED AS FOLLOWS:</strong></p>

                <div className="space-y-4">
                  <div className="grid grid-cols-[150px_1fr] gap-4">
                    <span className="font-bold">1. Principal Sum:</span>
                    <span>The Lender grants to the Borrower the sum of <strong>{formData.principalSum || '___________'}</strong> (the "Loan").</span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-4">
                    <span className="font-bold">2. Tenor:</span>
                    <span>The Loan shall be for a period of <strong>{formData.tenor || '___________'}</strong> commencing from the date of disbursement.</span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-4">
                    <span className="font-bold">3. Interest:</span>
                    <span>The Loan shall attract an interest rate of <strong>{formData.interestRate || '___________'}</strong> per annum/month.</span>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] gap-4">
                    <span className="font-bold">4. Repayment:</span>
                    <span>{formData.repaymentSchedule || 'The Borrower shall repay the principal sum and interest in accordance with the schedule attached hereto.'}</span>
                  </div>
                </div>

                <p className="mt-8">
                  <strong>IN WITNESS WHEREOF</strong> the parties have executed this Agreement the day and year first above written.
                </p>

                <div className="grid grid-cols-2 gap-12 mt-12">
                  <div className="space-y-8">
                    <p className="font-bold border-b border-black pb-2">SIGNED for and on behalf of<br/>BITSAVE SMART LIMITED</p>
                    <div className="h-20"></div>
                    <p className="border-t border-black pt-2">Authorized Signatory</p>
                  </div>
                  <div className="space-y-8">
                    <p className="font-bold border-b border-black pb-2">SIGNED by the BORROWER<br/>{formData.borrowerName.toUpperCase()}</p>
                    <div className="h-20"></div>
                    <p className="border-t border-black pt-2">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7B8B9A]/10 flex justify-end gap-3 bg-[#1A2538]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[#9BA8B5] font-medium hover:bg-[#7B8B9A]/10 rounded-xl transition-colors hover:text-[#F9F9FB]"
          >
            Cancel
          </button>
          {step === 'preview' && (
             <button
             onClick={handlePrint}
             className="px-5 py-2.5 bg-[#0F1825] text-[#F9F9FB] font-medium rounded-xl hover:bg-[#253247] transition-colors flex items-center gap-2 border border-[#7B8B9A]/20"
           >
             <Printer className="w-4 h-4" />
             Print
           </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#81D7B4] text-[#0F1825] font-bold rounded-xl hover:bg-[#6BC4A0] transition-colors shadow-lg shadow-[#81D7B4]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Agreement
          </button>
        </div>
      </motion.div>
    </div>
  );
}

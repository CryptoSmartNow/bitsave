import { Cancel01Icon, PrinterIcon, ViewIcon, CheckListIcon, Tick01Icon } from "hugeicons-react";
import { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/80 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1A2538] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#7B8B9A]/20"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#7B8B9A]/20 flex items-center justify-between bg-[#1A2538]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#81D7B4]/10 p-2.5 rounded-xl border border-[#81D7B4]/20">
              <ViewIcon className="w-5 h-5 text-[#81D7B4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F9F9FB] leading-tight">
                {step === 'edit' ? 'Edit Loan Agreement' : 'Preview Document'}
              </h2>
              <p className="text-xs text-[#9BA8B5] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></span>
                {business.businessName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#0F1825] p-1 rounded-xl border border-[#7B8B9A]/20">
              <button
                onClick={() => setStep('edit')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  step === 'edit'
                    ? 'bg-[#1A2538] text-[#81D7B4] shadow-md border border-[#81D7B4]/30'
                    : 'text-[#9BA8B5] hover:text-[#F9F9FB]'
                }`}
              >
                Edit Form
              </button>
              <button
                onClick={() => setStep('preview')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  step === 'preview'
                    ? 'bg-[#1A2538] text-[#81D7B4] shadow-md border border-[#81D7B4]/30'
                    : 'text-[#9BA8B5] hover:text-[#F9F9FB]'
                }`}
              >
                Preview Document
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 text-[#9BA8B5] hover:text-[#F9F9FB] hover:border-[#81D7B4]/30 hover:bg-[#1A2538] transition-all cursor-pointer"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#0F1825] relative custom-scrollbar">
          {step === 'edit' ? (
            <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-[#81D7B4] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-[#81D7B4]/50"></span>
                    Borrower Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Borrower Name / Entity</label>
                      <input
                        type="text"
                        name="borrowerName"
                        value={formData.borrowerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Full Address</label>
                      <input
                        type="text"
                        name="borrowerAddress"
                        value={formData.borrowerAddress}
                        onChange={handleInputChange}
                        placeholder="Street, City, State"
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/50 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#81D7B4] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-[#81D7B4]/50"></span>
                    Loan Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Principal Sum</label>
                      <input
                        type="text"
                        name="principalSum"
                        value={formData.principalSum}
                        onChange={handleInputChange}
                        placeholder="e.g. 5,000,000"
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/50 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Tenor (Duration)</label>
                      <input
                        type="text"
                        name="tenor"
                        value={formData.tenor}
                        onChange={handleInputChange}
                        placeholder="e.g. 12 months"
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/50 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Interest Rate</label>
                      <input
                        type="text"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        placeholder="e.g. 5%"
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/50 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Commencement Date</label>
                      <input
                        type="date"
                        name="commencementDate"
                        value={formData.commencementDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all [color-scheme:dark] text-xs sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Repayment Schedule</label>
                      <textarea
                        name="repaymentSchedule"
                        value={formData.repaymentSchedule}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe amortization or tranche schedule..."
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/50 resize-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto my-8 bg-white text-[#0F1825] p-8 sm:p-12 shadow-2xl min-h-[1000px] print:shadow-none print:m-0 print:w-full print:p-8 rounded-2xl">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-6">
                  Loan Agreement
                </h2>
                <p className="font-bold mb-1">BETWEEN</p>
                <p className="font-bold text-lg mb-1">BITSAVE SMART LIMITED</p>
                <p className="font-bold mb-1">AND</p>
                <p className="font-bold text-lg border-b border-black inline-block min-w-[300px] pb-1">
                  {formData.borrowerName?.toUpperCase() || '____________________'}
                </p>
              </div>

              <div className="font-serif leading-relaxed space-y-6 text-[13px] text-justify">
                <section>
                  <h3 className="font-bold text-sm mb-2">1. Parties Involved</h3>
                  <p className="mb-4">
                    This Loan Agreement (&ldquo;Agreement&rdquo;) is made on the <strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'do') : '___'}</strong> day of <strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'MMMM') : '__________'}</strong> 20<strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'yy') : '___'}</strong> between:
                  </p>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <strong>Bitsave Smart Limited</strong>, a company duly incorporated under the laws of the Federal Republic of Nigeria, with its registered office at 6, Nwosu street, Atali off tank, Port Harcourt, Rivers state, hereinafter referred to as &ldquo;Lender&rdquo; and
                    </li>
                    <li>
                      <strong>{formData.borrowerName?.toUpperCase() || '_________________________________________________________________'}</strong>, an enterprise duly registered under the laws of the Federal Republic of Nigeria, with its principal place of business at <strong>{formData.borrowerAddress || '_________________________________________________________________'}</strong> hereinafter referred to as &ldquo;Borrower&rdquo;.
                    </li>
                  </ol>
                  <p className="mt-3 italic">The Lender and the Borrower are hereinafter referred to individually as a &ldquo;Party&rdquo; and collectively as the &ldquo;Parties&rdquo;.</p>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">2. Purpose and Commercial Context</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>This Agreement sets out the general legal, commercial, and operational terms governing the provision of a loan facility by the Lender to the Borrower.</li>
                    <li>The Parties acknowledge that certain commercial terms of the Loan, including interest rate, tenor, repayment frequency, and repayment amounts, are transaction-specific.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">3. The Loan Facility</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      Subject to the terms and conditions of this Agreement, the Lender agrees to make available to the Borrower an unsecured loan facility in the principal sum of: <strong>₦{formData.principalSum || '________________________'}</strong> (the &ldquo;Loan&rdquo;).
                    </li>
                    <li>The Loan shall be applied strictly towards the Borrower&rsquo;s lawful business activities and working capital requirements.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">4. Tenor, Interest and Repayment</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Loan shall be granted for a period of <strong>{formData.tenor || '________________________'}</strong>, commencing from the date of disbursement.</li>
                    <li>The Loan shall attract interest at a fixed rate of <strong>{formData.interestRate || '_______'}</strong>%, calculated on the principal balance.</li>
                    <li>
                      {formData.repaymentSchedule && (
                        <div className="mt-3 bg-gray-50 p-4 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap">
                          <strong>Attached Schedule:</strong><br />
                          {formData.repaymentSchedule}
                        </div>
                      )}
                    </li>
                  </ol>
                </section>

                <div className="mt-12 pt-8 border-t-2 border-gray-100 break-inside-avoid">
                  <p className="mb-8 text-center font-bold">IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first written above</p>

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="font-bold text-xs uppercase border-b border-black pb-1">Signed on behalf of Bitsave Smart Limited:</p>
                      <div className="h-16 flex items-end justify-center"></div>
                      <p className="border-t border-black pt-1 font-bold">Karla Nwaeke</p>
                      <p className="text-xs text-gray-600">Founder and CEO, Bitsave Smart Limited</p>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold text-xs uppercase border-b border-black pb-1">Signed on behalf of the borrower:</p>
                      <div className="h-16"></div>
                      <p className="border-t border-black pt-1">Name: ______________________</p>
                      <p className="text-xs">Designation: ______________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#7B8B9A]/20 flex justify-end gap-3 bg-[#1A2538]/50 backdrop-blur-xl z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[#9BA8B5] font-bold text-xs uppercase tracking-wider hover:bg-[#0F1825] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#0F1825] text-[#F9F9FB] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#1A2538] transition-all flex items-center gap-2 border border-[#7B8B9A]/20 shadow-md cursor-pointer"
            >
              <PrinterIcon className="w-4 h-4 text-[#81D7B4]" />
              <span>Print Agreement</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#81D7B4] text-[#0F1825] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#6BC4A0] transition-all shadow-lg shadow-[#81D7B4]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Tick01Icon className="w-4 h-4" />
            )}
            <span>Save & Apply Agreement</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

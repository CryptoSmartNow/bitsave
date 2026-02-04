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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1A2538] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#7B8B9A]/10"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#81D7B4]/10 p-2.5 rounded-xl border border-[#81D7B4]/20">
              <Eye className="w-5 h-5 text-[#81D7B4]" />
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
            <div className="flex bg-[#0F1825] p-1 rounded-xl border border-[#7B8B9A]/10">
              <button
                onClick={() => setStep('edit')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${step === 'edit'
                  ? 'bg-[#1A2538] text-[#F9F9FB] shadow-md border border-[#7B8B9A]/10'
                  : 'text-[#9BA8B5] hover:text-[#F9F9FB]'
                  }`}
              >
                Edit
              </button>
              <button
                onClick={() => setStep('preview')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${step === 'preview'
                  ? 'bg-[#1A2538] text-[#F9F9FB] shadow-md border border-[#7B8B9A]/10'
                  : 'text-[#9BA8B5] hover:text-[#F9F9FB]'
                  }`}
              >
                Preview
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0F1825] border border-[#7B8B9A]/10 text-[#9BA8B5] hover:text-[#F9F9FB] hover:border-[#81D7B4]/30 hover:bg-[#1A2538] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#0F1825]/50 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

          {step === 'edit' ? (
            <div className="max-w-3xl mx-auto p-8 space-y-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-[#81D7B4]/50"></span>
                    Borrower Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Borrower Name</label>
                      <input
                        type="text"
                        name="borrowerName"
                        value={formData.borrowerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all"
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
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-4 flex items-center gap-2">
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
                        placeholder="e.g. $5,000"
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/30"
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
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/30"
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
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Commencement Date</label>
                      <input
                        type="date"
                        name="commencementDate"
                        value={formData.commencementDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all [color-scheme:dark]"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[11px] font-bold text-[#9BA8B5] uppercase tracking-wide ml-1">Repayment Schedule</label>
                      <textarea
                        name="repaymentSchedule"
                        value={formData.repaymentSchedule}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe how the loan will be repaid..."
                        className="w-full px-4 py-3 bg-[#1A2538]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#1A2538] transition-all placeholder:text-[#7B8B9A]/30 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto my-8 bg-white text-[#0F1825] p-12 shadow-2xl min-h-[1000px] print:shadow-none print:m-0 print:w-full print:p-12">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-6">
                  Loan Agreement
                </h2>
                <p className="font-bold mb-1">BETWEEN</p>
                <p className="font-bold text-lg mb-1">BITSAVE SMART LIMITED</p>
                <p className="font-bold mb-1">AND</p>
                <p className="font-bold text-lg border-b border-black inline-block min-w-[300px] pb-1">{formData.borrowerName?.toUpperCase() || '____________________'}</p>
              </div>

              <div className="font-serif leading-relaxed space-y-6 text-[13px] text-justify">
                <section>
                  <h3 className="font-bold text-sm mb-2">1. Parties involved</h3>
                  <p className="mb-4">
                    This Loan Agreement (“Agreement”) is made on the <strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'do') : '___'}</strong> day of <strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'MMMM') : '__________'}</strong> 20<strong>{formData.commencementDate ? format(new Date(formData.commencementDate), 'yy') : '___'}</strong> between;
                  </p>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <strong>Bitsave Smart Limited</strong>, a company duly incorporated under the laws of the Federal Republic of Nigeria, with its registered office at 6, Nwosu street, Atali off tank, Port Harcourt, Rivers state, hereinafter referred to as “lender” and
                    </li>
                    <li>
                      <strong>{formData.borrowerName?.toUpperCase() || '_________________________________________________________________'}</strong>, an enterprise duly registered under the laws of the Federal Republic of Nigeria, with its principal place of business at <strong>{formData.borrowerAddress || '_________________________________________________________________'}</strong> hereinafter referred to as “borrower”.
                    </li>
                  </ol>
                  <p className="mt-3 italic">The Lender and the Borrower are hereinafter referred to individually as a “Party” and collectively as the “Parties”.</p>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">2. Purpose and commercial context</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>This Agreement sets out the general legal, commercial, and operational terms governing the provision of a loan facility by the Lender to the Borrower. It establishes the baseline rights and obligations applicable to the lending relationship between the Parties.</li>
                    <li>The Parties acknowledge that certain commercial terms of the Loan, including but not limited to the interest rate, tenor, repayment frequency, and repayment amounts, are transaction-specific and shall be agreed separately for each loan extended under this Agreement. Such commercial terms shall be completed in the relevant sections of this Agreement or documented in a supplemental schedule, offer letter, or other written confirmation agreed between the Parties, which shall form part of this Agreement.</li>
                  </ol>
                  <div className="text-center my-4 text-xs text-gray-400">________________</div>
                  <ol className="list-decimal pl-5 space-y-3" start={3}>
                    <li>This Agreement is intended to operate as a standard-form lending framework for use by the Lender in the ordinary course of its SME financing activities. It is designed to ensure consistency, scalability, and regulatory compliance across multiple borrowing relationships, while allowing flexibility for the commercial terms of individual loans to be tailored to the credit profile and circumstances of the borrower.</li>
                    <li>In the event of any inconsistency between the general terms of this Agreement and any agreed commercial schedule or supplemental document, the terms of such schedule or supplemental document shall prevail to the extent of the inconsistency, solely in respect of the relevant Loan.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">3. The Loan facility</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      Subject to the terms and conditions of this Agreement, the Lender agrees to make available to the Borrower an unsecured loan facility in the principal sum of: <strong>₦{formData.principalSum || '________________________'}</strong> (the “Loan”).
                    </li>
                    <li>The Loan shall be applied strictly towards the Borrower’s lawful business activities and working capital requirements. The Borrower undertakes that the Loan shall not be applied for speculative purposes, personal consumption, illegal activities, or any purpose prohibited under applicable law or regulatory guidance.</li>
                    <li>The availability and disbursement of the Loan are conditional upon the Lender’s satisfaction, acting reasonably and in accordance with its internal credit and risk assessment processes, that all pre-disbursement requirements have been met and that no event, circumstance, or information exists which, in the Lender’s reasonable opinion, materially impairs or is likely to impair the Borrower’s ability to perform its repayment obligations under this Agreement.</li>
                    <li>The Lender’s agreement to make the Loan available shall not be construed as a waiver of its right to withhold, suspend, or decline disbursement where such action is necessary to comply with applicable laws, regulatory requirements, or prudent risk management standards.</li>
                  </ol>
                  <div className="text-center my-4 text-xs text-gray-400">________________</div>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">4. Condition precedent to disbursement</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Parties acknowledge that the Lender operates within a regulated financial and risk-managed environment and, accordingly, the disbursement of the Loan is conditional upon the Lender satisfying itself that the Borrower meets its applicable credit, compliance, and risk assessment standards.</li>
                    <li>
                      Prior to disbursement, the Lender may require the Borrower to provide such documents, information, confirmations, or evidence as the Lender reasonably considers necessary to:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>verify the legal existence, ownership, and capacity of the Borrower;</li>
                        <li>identify and verify the Borrower, its principals, directors, or beneficial owners in accordance with applicable know-your-customer (KYC) and anti-money laundering (AML) requirements;</li>
                        <li>assess the Borrower’s operational, financial, and transactional profile for credit risk purposes; and</li>
                        <li>confirm that the Borrower has obtained all licences, permits, approvals, or authorisations relevant to the conduct of its business and the utilisation of the Loan.</li>
                      </ul>
                    </li>
                    <li>The Borrower acknowledges that the satisfaction of the conditions precedent is intended to protect the integrity of the lending relationship and does not constitute a representation by the Lender as to the Borrower’s creditworthiness or future performance.</li>
                    <li>
                      The Lender shall be entitled, acting reasonably and in good faith, to withhold, defer, or decline disbursement of the Loan where:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>any required information or documentation is incomplete, inaccurate, or misleading;</li>
                        <li>a material change occurs in the Borrower’s financial or operational condition; or</li>
                        <li>disbursement would expose the Lender to regulatory, legal, or prudential risk.</li>
                      </ul>
                    </li>
                    <li>The Lender may, at its discretion, waive any condition precedent in whole or in part. Any such waiver shall apply only to the specific disbursement in respect of which it is granted and shall not constitute a waiver of the same or any other condition precedent in respect of any subsequent disbursement.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">5. Tenor, Interest and Repayment</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Loan shall be granted for a period of <strong>{formData.tenor || '________________________'}</strong>, commencing from the date of disbursement and expiring on the final repayment date agreed by the Parties (the “Tenor”).</li>
                    <li>The Loan shall attract interest at a fixed rate of <strong>{formData.interestRate || '_______'}</strong>%, calculated on the principal balance which shall accrue from the date of disbursement until the Loan is fully repaid.</li>
                    <li>Any overdue amount may attract additional interest at a rate to be agreed, without prejudice to the Lender’s other rights under this Agreement.</li>
                    <li>The Borrower shall repay the Loan together with accrued interest in accordance with the repayment structure agreed by the Parties.</li>
                    <li>
                      The Borrower agrees to repay on an amortized loan schedule amount of __________________ on a ____________ basis for a period of __________________ starting from the date of disbursement.
                      <br className="my-2" />
                      For one time payment, Borrower agrees to pay a one time amount of Interest and Principal, totalling at ___________________ on this date ________________________.
                      {formData.repaymentSchedule && (
                        <div className="mt-3 bg-gray-50 p-4 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap">
                          <strong>Attached Schedule:</strong><br />
                          {formData.repaymentSchedule}
                        </div>
                      )}
                    </li>
                    <li>All payments applied by the Lender first to any costs or charges due, then to principal, and finally to accrued interest, unless otherwise agreed.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">6. Right of Set-off and Recovery</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Borrower acknowledges that, notwithstanding the nature of the Loan, the Lender shall have the contractual right to apply any monies, balances, or credit positions held by the Borrower with the Lender or accessible to it, towards the settlement of any outstanding obligations under this Agreement.</li>
                    <li>Where the Borrower is a sole proprietor or owner-managed enterprise, the Borrower agrees that, subject to applicable law and due process, personal assets lawfully accessible to the Borrower may be applied to settle outstanding obligations if repayment defaults occur. This right of set-off does not constitute a security interest and is strictly contractual.</li>
                  </ol>
                  <div className="text-center my-4 text-xs text-gray-400">________________</div>
                  <ol className="list-decimal pl-5 space-y-3" start={3}>
                    <li>
                      The Lender may exercise this right in a commercially reasonable manner, ensuring that any application of set-off:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>complies with applicable Nigerian law, regulation, and constitutional protections;</li>
                        <li>is proportionate to the outstanding liability; and</li>
                        <li>is transparent and auditable, maintaining accurate records of any transactions applied under this clause.</li>
                      </ul>
                    </li>
                    <li>The Parties acknowledge that this right is a standard risk mitigation measure to preserve the integrity and recoverability of the lending portfolio. It ensures that, even in the absence of formal collateral, the lender has a legally enforceable mechanism to recover funds in a manner consistent with industry practice.</li>
                    <li>Any exercise of this right shall be without prejudice to the Lender’s other rights and remedies under this Agreement or at law, including but not limited to pursuing recovery through legal proceedings.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">7. Borrower’s Undertakings</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Borrower undertakes to conduct its business prudently and in accordance with applicable law, ensuring that all operations are transparent, accountable, and consistent with accepted commercial practices.</li>
                    <li>
                      The Borrower shall promptly notify the Lender, in writing, of any event or circumstance which may materially affect:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>its business operations or financial condition;</li>
                        <li>its ability to meet repayment obligations; or</li>
                        <li>the accuracy of any representations and warranties made under this Agreement.</li>
                      </ul>
                    </li>
                    <li>The Borrower undertakes to maintain proper books, records, and accounts in accordance with generally accepted accounting principles, and to allow the Lender, upon reasonable request, access to financial, operational, or transactional information for the purpose of monitoring credit exposure, assessing risk, or fulfilling regulatory obligations.</li>
                  </ol>
                  <div className="text-center my-4 text-xs text-gray-400">________________</div>
                  <ol className="list-decimal pl-5 space-y-3" start={4}>
                    <li>
                      The Borrower shall not, without the prior written consent of the Lender:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>incur material additional debt beyond agreed limits;</li>
                        <li>dispose of substantial assets outside the ordinary course of business; or</li>
                        <li>make material changes to the nature, scale, or structure of its business that could adversely affect repayment.</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">8. Representation and Warranties</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      The Borrower represents and warrants that:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>it is duly constituted and has full capacity to enter into this Agreement;</li>
                        <li>this Agreement constitutes valid and binding obligations;</li>
                        <li>it is solvent and able to meet its obligations as they fall due;</li>
                        <li>no material litigation or insolvency proceedings are pending or threatened;</li>
                        <li>all information provided to the Lender is true, complete, and not misleading.</li>
                      </ul>
                    </li>
                    <p className="mt-1 italic">Each representation shall be deemed repeated on each repayment date.</p>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">9. Event of default</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      Each of the following shall constitute an Event of Default:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>failure to pay any amount when due;</li>
                        <li>breach of any material obligation under this Agreement;</li>
                        <li>insolvency, cessation of business, or inability to pay debts;</li>
                        <li>any representation proving to be materially incorrect;</li>
                        <li>any event which materially impairs the Borrower’s ability to perform its obligations.</li>
                      </ul>
                    </li>
                    <li>
                      Upon the occurrence of an Event of Default, the Lender may:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>declare all outstanding amounts immediately due and payable;</li>
                        <li>suspend or terminate further access to credit;</li>
                        <li>exercise its rights of recovery in accordance with law.</li>
                      </ul>
                    </li>
                    <li>All enforcement actions shall be carried out in compliance with applicable Nigerian law and due process.</li>
                    <li>The Borrower shall bear reasonable costs incurred in connection with the administration and enforcement of this Agreement.</li>
                    <li>The Borrower shall indemnify the Lender against losses arising from the Borrower’s breach of this Agreement, except where caused by the Lender’s gross negligence or wilful misconduct.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">10. Confidentiality</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>All proprietary information, business data, client records, platform data, and related information disclosed or generated in connection with this Agreement shall not be disclosed, shared, or made accessible to any third party without the prior written consent of the disclosing party, except where disclosure is required by applicable law, regulatory authority, or valid court order.</li>
                    <li>Each party further agrees to take all reasonable measures to protect such confidential information from unauthorized use, access, or disclosure, and to use it solely for the purpose of fulfilling their obligations under this Agreement.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">11. Ethical consideration</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>The Parties acknowledge that enforcement of this Agreement shall respect the Constitution of the Federal Republic of Nigeria and shall not involve harassment, coercion, unlawful detention, or degrading treatment.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">12. Dispute Resolution</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>In the event of any dispute, controversy, or claim arising out of or in connection with this Agreement (“Dispute”), the Parties shall first attempt to resolve the Dispute amicably through good faith discussions. Such discussions may take place in person, by electronic communication, or any other mutually agreed medium.</li>
                    <li>If the Dispute is not resolved within thirty (30) calendar days from the date either Party notifies the other of the Dispute, the Parties agree to submit the Dispute to mediation. The mediator shall be a neutral third party mutually agreed upon by the Parties. The Parties shall share the mediator’s fees equally unless otherwise agreed in writing. Mediation shall be conducted in accordance with rules agreed by the Parties or, in the absence of agreement, as reasonably determined by the mediator.</li>
                  </ol>
                  <div className="text-center my-4 text-xs text-gray-400">________________</div>
                  <ol className="list-decimal pl-5 space-y-3" start={3}>
                    <li>If the Dispute remains unresolved following mediation, the Parties agree that the Dispute shall be finally settled by arbitration in accordance with the Arbitration and Conciliation Act (Cap A18, Laws of the Federation of Nigeria 2004, as amended). The arbitration shall be conducted by a sole arbitrator or a panel of arbitrators as agreed by the Parties. The arbitration proceedings shall be conducted in English, and the seat of arbitration shall be in any city in Nigeria stated by the lender. The decision of the arbitrator(s) shall be final and binding on the Parties, and judgment upon the award rendered may be entered in any court having jurisdiction.</li>
                    <li>Nothing in this Clause shall prevent either Party from seeking interim or injunctive relief from a court of competent jurisdiction to protect its rights or assets pending resolution of the Dispute through the above mechanisms.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-bold text-sm mb-2">13. Governing Law</h3>
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>This MoU shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</li>
                    <li>Any legal action or proceeding arising out of or in connection with this MoU will be brought exclusively in the courts of the Federal Republic of Nigeria.</li>
                  </ol>
                </section>

                <div className="mt-12 pt-8 border-t-2 border-gray-100 break-inside-avoid">
                  <p className="mb-8 text-center font-bold">IN WITNESS WHEREOF, the Parties have executed this Agreement on the date first written above</p>

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="font-bold text-xs uppercase border-b border-black pb-1">Signed on behalf of Bitsave Smart Limited:</p>
                      <div className="h-16 flex items-end justify-center">
                        <img src="/signature.png" alt="" className="max-h-16 opacity-0" /> {/* Placeholder for signature if needed */}
                      </div>
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
        <div className="p-5 border-t border-[#7B8B9A]/10 flex justify-end gap-3 bg-[#1A2538]/50 backdrop-blur-xl z-10">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[#9BA8B5] font-bold text-xs uppercase tracking-wider hover:bg-[#1A2538] rounded-xl transition-colors"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-[#1A2538] text-[#F9F9FB] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#253247] transition-all flex items-center gap-2 border border-[#7B8B9A]/20 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#81D7B4] text-[#0F1825] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#6BC4A0] transition-all shadow-lg shadow-[#81D7B4]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
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

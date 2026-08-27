import {
  Cancel01Icon,
  Calendar01Icon,
  Wallet01Icon,
  Building04Icon,
  Ticket01Icon,
  Dollar01Icon,
  Message02Icon,
  File01Icon
} from "hugeicons-react";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface BusinessDetailsModalProps {
  business: any;
  onClose: () => void;
  onOpenAgreement: () => void;
}

export default function BusinessDetailsModal({ business, onClose, onOpenAgreement }: BusinessDetailsModalProps) {
  const router = useRouter();

  if (!business) return null;

  const handleMessage = () => {
    const params = new URLSearchParams({
      businessId: business.owner || business.transactionHash,
      businessName: business.businessName
    });
    router.push(`/bizfi/admin/chat?${params.toString()}`);
  };

  const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: any }) => (
    <div className="flex items-start gap-3 p-3.5 bg-[#0F1825] rounded-xl border border-[#7B8B9A]/15">
      {Icon && <Icon className="w-4 h-4 text-[#81D7B4] mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#7B8B9A] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-[#F9F9FB] font-medium break-words text-xs sm:text-sm">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070A0F]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A2538] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#7B8B9A]/20 font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#7B8B9A]/20 flex items-center justify-between bg-[#0F1825]">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 mr-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center text-[#81D7B4] font-black text-lg sm:text-xl border border-[#81D7B4]/30 shrink-0">
              {(business.businessName || 'B').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-black text-[#F9F9FB] break-words line-clamp-2">{business.businessName}</h2>
              <p className="text-xs text-[#7B8B9A] font-mono truncate">{business.transactionHash}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A2538] rounded-xl text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors shrink-0 cursor-pointer"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Status Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/15">
            <div className="flex-1">
              <p className="text-[#7B8B9A] text-xs font-bold uppercase tracking-wider mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  business.status === 'approved' ? 'bg-[#81D7B4] animate-pulse' :
                  business.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                <span className="capitalize font-bold text-base text-[#F9F9FB]">{business.status || 'pending'}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#1A2538] rounded-xl border border-[#7B8B9A]/20">
              <p className="text-[#7B8B9A] text-[10px] font-bold uppercase tracking-wider mb-0.5">Tier Level</p>
              <p className="text-[#81D7B4] font-black capitalize text-xs">{business.tier || 'builder'}</p>
            </div>
          </div>

          {/* Core Details */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#81D7B4] mb-3 flex items-center gap-2">
              <Building04Icon className="w-4 h-4 text-[#81D7B4]" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <DetailRow label="Owner Address" value={business.owner} icon={Wallet01Icon} />
              <DetailRow label="Registration Date" value={business.createdAt ? format(new Date(business.createdAt), 'PPpp') : '-'} icon={Calendar01Icon} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailRow label="Fee Paid" value={business.feePaid ? `$${business.feePaid}` : 'Free / Included'} icon={Dollar01Icon} />
                <DetailRow label="Referral Code" value={business.referralCode} icon={Ticket01Icon} />
              </div>
            </div>
          </div>

          {/* Metadata */}
          {business.metadata && Object.keys(business.metadata).length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#81D7B4] mb-3 flex items-center gap-2">
                <File01Icon className="w-4 h-4 text-[#81D7B4]" />
                Additional KYC Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(business.metadata).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  return (
                    <DetailRow
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').trim()}
                      value={String(value)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7B8B9A]/20 bg-[#0F1825] flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-[#7B8B9A] font-bold text-xs hover:bg-[#1A2538] rounded-xl transition-colors hover:text-[#F9F9FB] order-3 sm:order-1 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleMessage}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1A2538] border border-[#81D7B4]/30 text-[#81D7B4] font-bold text-xs rounded-xl hover:bg-[#81D7B4]/10 transition-colors flex items-center justify-center gap-2 order-2 cursor-pointer"
          >
            <Message02Icon className="w-4 h-4" />
            Message Owner
          </button>
          <button
            onClick={onOpenAgreement}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#81D7B4] text-[#0F1825] font-black text-xs rounded-xl hover:bg-[#6BC4A0] transition-all shadow-[0_4px_14px_rgba(129,215,180,0.25)] flex items-center justify-center gap-2 order-1 sm:order-3 cursor-pointer"
          >
            <File01Icon className="w-4 h-4" />
            Manage Loan Agreement
          </button>
        </div>
      </motion.div>
    </div>
  );
}

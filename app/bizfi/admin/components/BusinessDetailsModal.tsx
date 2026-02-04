
import { motion } from 'framer-motion';
import { X, FileText, Calendar, Wallet, Building2, Ticket, DollarSign, MessageSquare } from 'lucide-react';
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
      businessId: business.owner,
      businessName: business.businessName
    });
    router.push(`/bizfi/admin/chat?${params.toString()}`);
  };

  const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: any }) => (
    <div className="flex items-start gap-3 p-3 bg-[#0F1825]/50 rounded-xl border border-[#7B8B9A]/10">
      {Icon && <Icon className="w-5 h-5 text-[#9BA8B5] mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#9BA8B5] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[#F9F9FB] font-medium break-words text-sm">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F1825]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A2538] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#7B8B9A]/10"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 mr-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] font-bold text-lg sm:text-xl border border-[#81D7B4]/20 shrink-0">
              {business.businessName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#F9F9FB] break-words line-clamp-2">{business.businessName}</h2>
              <p className="text-xs sm:text-sm text-[#9BA8B5] font-mono truncate">{business.transactionHash}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#7B8B9A]/10 rounded-lg text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Status Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-[#0F1825]/50 rounded-xl border border-[#7B8B9A]/10">
            <div className="flex-1">
              <p className="text-[#9BA8B5] text-xs font-medium uppercase tracking-wider mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${business.status === 'approved' ? 'bg-[#81D7B4]' :
                    business.status === 'pending' ? 'bg-[#81D7B4CC]' :
                      'bg-red-400'
                  }`} />
                <span className="capitalize font-bold text-base sm:text-lg text-[#F9F9FB]">{business.status}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-[#1A2538] rounded-lg border border-[#7B8B9A]/20">
              <p className="text-[#9BA8B5] text-xs font-medium uppercase tracking-wider mb-1">Tier</p>
              <p className="text-[#81D7B4] font-bold capitalize">{business.tier}</p>
            </div>
          </div>

          {/* Core Details */}
          <div>
            <h3 className="text-sm font-bold text-[#F9F9FB] mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#81D7B4]" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <DetailRow label="Owner Address" value={business.owner} icon={Wallet} />
              <DetailRow label="Registration Date" value={business.createdAt ? format(new Date(business.createdAt), 'PPpp') : '-'} icon={Calendar} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow label="Fee Paid" value={business.feePaid ? `$${business.feePaid}` : 'Free'} icon={DollarSign} />
                <DetailRow label="Referral Code" value={business.referralCode} icon={Ticket} />
              </div>
            </div>
          </div>

          {/* Metadata (if available) */}
          {business.metadata && (
            <div>
              <h3 className="text-sm font-bold text-[#F9F9FB] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#81D7B4]" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(business.metadata).map(([key, value]) => {
                  if (typeof value === 'object') return null; // Skip nested objects for now
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
        <div className="p-4 border-t border-[#7B8B9A]/10 bg-[#1A2538] flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-[#9BA8B5] font-medium hover:bg-[#7B8B9A]/10 rounded-xl transition-colors hover:text-[#F9F9FB] order-3 sm:order-1"
          >
            Close
          </button>
          <button
            onClick={handleMessage}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1A2538] border border-[#81D7B4]/30 text-[#81D7B4] font-bold rounded-xl hover:bg-[#81D7B4]/10 transition-colors flex items-center justify-center gap-2 order-2"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
          <button
            onClick={onOpenAgreement}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#81D7B4] text-[#0F1825] font-bold rounded-xl hover:bg-[#6BC4A0] transition-colors shadow-lg shadow-[#81D7B4]/20 flex items-center justify-center gap-2 order-1 sm:order-3"
          >
            <FileText className="w-4 h-4" />
            Manage Loan Agreement
          </button>
        </div>
      </motion.div>
    </div>
  );
}

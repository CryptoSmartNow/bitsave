'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineChartBar
} from 'react-icons/hi2';

const MOCK_ALERTS = [
  { id: 1, type: 'success', title: 'Yield Distribution Complete', message: 'Your monthly BizYield distribution of $12.50 USDC has been successfully deposited to your wallet.', time: '2 hours ago', isNew: true },
  { id: 2, type: 'info', title: 'New BizCredit Pool Available', message: 'A new 14% APY BizCredit pool is now open for funding. Capacity is limited to $50,000.', time: '1 day ago', isNew: true },
  { id: 3, type: 'info', title: 'Platform Update', message: 'We have updated our smart contracts to support faster withdrawals. No action is required on your end.', time: '3 days ago', isNew: false },
  { id: 4, type: 'success', title: 'Purchase Confirmed', message: 'Your purchase of 5 BizBond certificates has been confirmed. View them in the Certificates tab.', time: '1 week ago', isNew: false },
];

export default function AlertsPage() {
  const { connected } = useWallet();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, isNew: false })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <HiOutlineCheckCircle className="w-6 h-6 text-[#81D7B4]" />;
      case 'info': return <HiOutlineInformationCircle className="w-6 h-6 text-[#3B82F6]" />;
      default: return <HiOutlineBell className="w-6 h-6 text-[#7B8B9A]" />;
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <HiOutlineBell className="w-16 h-16 text-[#2C3E5D] mb-6" />
        <h2 className="text-2xl font-black text-[#F9F9FB] mb-2">Wallet Not Connected</h2>
        <p className="text-[#7B8B9A] mb-8 max-w-sm">Please connect your Solana wallet to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[800px] mx-auto space-y-6 md:space-y-8 min-w-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1C2538] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#F9F9FB]">Alerts & Notifications</h1>
          <p className="text-sm text-[#7B8B9A] mt-1">Stay updated on your payouts and platform news.</p>
        </div>
        {alerts.some(a => a.isNew) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-[#81D7B4] hover:text-[#F9F9FB] transition-colors bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 px-4 py-2 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-5 rounded-2xl border transition-colors flex gap-4 ${
              alert.isNew 
                ? 'bg-[#1A2538] border-[#2C3E5D]' 
                : 'bg-[#121A27] border-[#1C2538]'
            }`}
          >
            <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${alert.type === 'success' ? 'bg-[#81D7B4]/10' : 'bg-[#3B82F6]/10'}`}>
              {getIcon(alert.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">
                <h3 className={`font-bold ${alert.isNew ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'}`}>
                  {alert.title}
                </h3>
                <span className="text-xs font-mono text-[#4B5A75] shrink-0">{alert.time}</span>
              </div>
              <p className={`text-sm mt-1 ${alert.isNew ? 'text-[#7B8B9A]' : 'text-[#4B5A75]'}`}>
                {alert.message}
              </p>
            </div>
            {alert.isNew && (
              <div className="w-2 h-2 rounded-full bg-[#81D7B4] shrink-0 mt-2" />
            )}
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="py-12 text-center text-[#7B8B9A]">
            You're all caught up! No new notifications.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/adminAuth';
import { 
  Trophy, 
  ArrowRightLeft, 
  Bell, 
  LogOut, 
  Edit2, 
  Trash2, 
  Hammer,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  Plus
} from 'lucide-react';

// --- MAIN PAGE COMPONENT ---
export default function DevAdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}

// --- AUTH CONTENT WRAPPER ---
function AdminContent() {
  const { user, loading, login, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'transactions' | 'updates'>('transactions');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#81D7B4]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hammer className="w-8 h-8 text-[#0f766e]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dev Admin Access</h1>
            <p className="text-gray-500 text-sm">Restricted access for developers only.</p>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const success = await login(password);
            if (!success) setError('Invalid password');
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-4 focus:ring-[#81D7B4]/10 transition-all outline-none text-gray-900"
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-[#81D7B4] hover:bg-[#6BC6A3] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#81D7B4]/20"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#81D7B4] rounded-lg flex items-center justify-center text-gray-900 text-sm">DA</span>
            Dev Admin
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')} 
            icon={<ArrowRightLeft className="w-5 h-5" />} 
            label="Transactions" 
          />
          <SidebarItem 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')} 
            icon={<Trophy className="w-5 h-5" />} 
            label="Leaderboard" 
          />
          <SidebarItem 
            active={activeTab === 'updates'} 
            onClick={() => setActiveTab('updates')} 
            icon={<Bell className="w-5 h-5" />} 
            label="Updates" 
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex md:hidden justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Dev Admin</h1>
            <button onClick={logout} className="text-red-600 text-sm">Logout</button>
          </header>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h1>
            <p className="text-gray-500 mt-2">Manage your application data and test system integrity.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
            {activeTab === 'leaderboard' && <LeaderboardPanel />}
            {activeTab === 'transactions' && <TransactionsPanel />}
            {activeTab === 'updates' && <UpdatesPanel />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
        active 
          ? 'bg-[#81D7B4]/10 text-[#0f766e]' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={active ? 'text-[#0f766e]' : 'text-gray-400'}>{icon}</span>
      {label}
    </button>
  );
}

// --- LEADERBOARD PANEL ---
function LeaderboardPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    useraddress: '',
    totalamount: '',
    chain: 'base'
  });

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leaderboard entry?')) return;
    try {
      const res = await fetch(`/api/leaderboard?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchLeaderboard();
      else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      useraddress: user.useraddress,
      totalamount: user.totalamount.toString(),
      chain: user.chain || 'base'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      useraddress: '',
      totalamount: '',
      chain: 'base'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/leaderboard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingId })
        });
        if (res.ok) {
          handleCancelEdit();
          fetchLeaderboard();
          alert('Entry updated');
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } else {
        // Create
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setFormData({ useraddress: '', totalamount: '', chain: 'base' });
          fetchLeaderboard();
          alert('Entry created');
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-gray-200 min-h-[600px]">
      {/* List Section */}
      <div className="xl:col-span-2 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Current Leaderboard</h3>
          <button 
            onClick={fetchLeaderboard} 
            className="text-sm text-[#0f766e] font-medium hover:underline"
          >
            Refresh Data
          </button>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">Rank</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">User Address</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Total Saved</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Network</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading leaderboard data...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No active users found</td></tr>
                ) : (
                  currentUsers.map((user, idx) => {
                    const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                    return (
                      <tr key={user.id || idx} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            globalIdx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            globalIdx === 1 ? 'bg-gray-100 text-gray-700' :
                            globalIdx === 2 ? 'bg-orange-100 text-orange-700' :
                            'text-gray-500'
                          }`}>
                            {globalIdx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{user.useraddress}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">${user.totalamount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                            {user.chain}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(user)} className="p-1.5 text-gray-400 hover:text-[#0f766e] hover:bg-[#81D7B4]/10 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, users.length)}</span> of <span className="font-medium">{users.length}</span> results
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="p-6 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Entry' : 'New Entry'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">User Address</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] focus:border-[#81D7B4] outline-none text-sm font-mono text-gray-900"
              placeholder="0x..."
              value={formData.useraddress}
              onChange={e => setFormData({...formData, useraddress: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Saved</label>
            <input 
              type="number" 
              required
              step="0.000001"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
              placeholder="0.00"
              value={formData.totalamount}
              onChange={e => setFormData({...formData, totalamount: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chain</label>
            <select 
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
              value={formData.chain}
              onChange={e => setFormData({...formData, chain: e.target.value})}
            >
              <option value="base">Base</option>
              <option value="optimism">Optimism</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-[#81D7B4] hover:bg-[#6BC6A3] text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              {editingId ? 'Save Changes' : 'Create Record'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- TRANSACTIONS PANEL ---
function TransactionsPanel() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    txnhash: '',
    chain: 'base',
    savingsname: 'Dev Test Savings',
    useraddress: '',
    transaction_type: 'deposit',
    currency: 'USDC'
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions?limit=50');
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTransactions();
      else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tx: any) => {
    setEditingId(tx.id);
    setFormData({
      amount: tx.amount,
      txnhash: tx.txnhash || '',
      chain: tx.chain,
      savingsname: tx.savingsname || '',
      useraddress: tx.useraddress,
      transaction_type: tx.transaction_type,
      currency: tx.currency
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      txnhash: '',
      chain: 'base',
      savingsname: 'Dev Test Savings',
      useraddress: '',
      transaction_type: 'deposit',
      currency: 'USDC'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingId })
        });
        if (res.ok) {
          handleCancelEdit();
          fetchTransactions();
          alert('Transaction updated');
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } else {
        // Create
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          // Reset form but keep some defaults
          setFormData(prev => ({ ...prev, txnhash: '', amount: '' }));
          fetchTransactions();
          alert('Transaction created');
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-gray-200 min-h-[600px]">
      {/* List Section */}
      <div className="xl:col-span-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
          <button onClick={fetchTransactions} className="text-sm text-[#0f766e] font-medium hover:underline">Refresh List</button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">No transactions found</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#81D7B4] hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.transaction_type === 'deposit' ? 'bg-green-100 text-green-600' :
                    tx.transaction_type === 'withdraw' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.transaction_type === 'deposit' ? <ArrowDownCircle className="w-5 h-5" /> : 
                     tx.transaction_type === 'withdraw' ? <ArrowUpCircle className="w-5 h-5" /> : 
                     <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{tx.amount} {tx.currency}</div>
                    <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{tx.useraddress}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium uppercase text-gray-500">{tx.chain}</div>
                    <div className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(tx)} className="p-2 text-gray-400 hover:text-[#0f766e] hover:bg-[#81D7B4]/10 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="p-6 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Transaction' : 'New Transaction'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">User Address</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] focus:border-[#81D7B4] outline-none text-sm font-mono text-gray-900"
              placeholder="0x..."
              value={formData.useraddress}
              onChange={e => setFormData({...formData, useraddress: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
              <input 
                type="number" 
                required
                step="0.000001"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
                value={formData.transaction_type}
                onChange={e => setFormData({...formData, transaction_type: e.target.value})}
              >
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
                <option value="topup">Topup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chain</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
                value={formData.chain}
                onChange={e => setFormData({...formData, chain: e.target.value})}
              >
                <option value="base">Base</option>
                <option value="optimism">Optimism</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tx Hash</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm font-mono text-gray-900"
              placeholder="0x..."
              value={formData.txnhash}
              onChange={e => setFormData({...formData, txnhash: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-[#81D7B4] hover:bg-[#6BC6A3] text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              {editingId ? 'Save Changes' : 'Create Record'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- UPDATES PANEL ---
function UpdatesPanel() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/updates');
      const data = await res.json();
      if (Array.isArray(data)) setUpdates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUpdates(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this update?')) return;
    try {
      const res = await fetch(`/api/updates?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchUpdates();
      else alert('Failed to delete');
    } catch (err) { console.error(err); }
  };

  const handleEdit = (update: any) => {
    setEditingId(update.id);
    setFormData({ title: update.title, content: update.content });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch('/api/updates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingId })
        });
        if (res.ok) {
          handleCancelEdit();
          fetchUpdates();
          alert('Updated!');
        }
      } else {
        const res = await fetch('/api/updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setFormData({ title: '', content: '' });
          fetchUpdates();
          alert('Published!');
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-gray-200 min-h-[600px]">
      <div className="xl:col-span-2 p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900">Live Updates</h3>
          <button onClick={fetchUpdates} className="text-sm text-[#0f766e] font-medium hover:underline">Refresh</button>
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">No updates published</div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-[#81D7B4] hover:shadow-md transition-all relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(update)} className="p-1.5 text-gray-400 hover:text-[#0f766e] hover:bg-[#81D7B4]/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(update.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${update.isNew ? 'bg-[#81D7B4]/20 text-[#0f766e]' : 'bg-gray-100 text-gray-600'}`}>
                  {update.isNew ? 'New' : 'Published'}
                </span>
                <span className="text-xs text-gray-400">{new Date(update.date).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{update.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{update.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{editingId ? 'Edit Update' : 'New Update'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm text-gray-900"
              placeholder="Update Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Content</label>
            <textarea 
              required
              rows={6}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#81D7B4] outline-none text-sm resize-none text-gray-900"
              placeholder="What's new?"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-[#81D7B4] hover:bg-[#6BC6A3] text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              {editingId ? 'Save Changes' : 'Publish'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

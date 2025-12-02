'use client';

import { useState, useEffect } from 'react';
// Using inline SVG icons instead of @heroicons/react
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  transaction_type?: string;
  type?: string;
  status?: string;
  created_at?: string;
  timestamp?: string;
  txnhash?: string;
  chain?: string;
  savingsname?: string;
  useraddress?: string;
  hash?: string;
  from?: string;
  to?: string;
  gasUsed?: number;
  gasPrice?: number;
  blockNumber?: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export default function USDGLOPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [rawResponse, setRawResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://bitsaveapi.vercel.app/transactions/currency/usdglo', {
          headers: {
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setRawResponse(result);

        // Handle different API response structures
        if (Array.isArray(result)) {
          setData({
            count: result.length,
            next: null,
            previous: null,
            results: result
          });
        } else if (result.results) {
          setData(result);
        } else {
          setData({
            count: result.count || 0,
            next: result.next || null,
            previous: result.previous || null,
            results: result.data || result.transactions || []
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #81D7B4, #81D7B4)' }}>
          <h1 className="text-xl font-medium text-white">Bitsave Protocol USDGLO Transactions API</h1>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#81D7B4' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-800 text-white px-6 py-4">
          <h1 className="text-xl font-medium">USDGLO Transactions API</h1>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading transactions</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-6 py-4" style={{ background: 'linear-gradient(135deg, #81D7B4, #81D7B4)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Bitsave Protocol USDGLO Transactions API</h1>
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>USDGLO Transactions</li>
          </ol>
        </nav>

        {/* API Info */}
        <div className="bg-white rounded-lg shadow-sm mb-6" style={{ border: '1px solid #81D7B4' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#81D7B4', background: 'linear-gradient(135deg, #81D7B4/5, #81D7B4/10)' }}>
            <h2 className="text-lg font-medium" style={{ color: '#81D7B4' }}>Transaction And Currency List</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white mr-3" style={{ backgroundColor: '#81D7B4' }}>
                  GET
                </span>
                <code className="text-sm text-gray-600">/transactions/currency/usdglo</code>
              </div>
              <div className="text-sm text-gray-600">
                <strong>HTTP 200 OK</strong><br />
                <strong>Allow:</strong> GET, HEAD, OPTIONS<br />
                <strong>Content-Type:</strong> application/json<br />
                <strong>Vary:</strong> Accept
              </div>
            </div>
          </div>
        </div>

        {/* Response Data */}
        <div className="bg-white rounded-lg shadow-sm" style={{ border: '1px solid #81D7B4' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#81D7B4' }}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFilters ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                style={showFilters ? { backgroundColor: '#81D7B4' } : {}}
              >
                {showFilters ? '✓ Filters' : 'Filters'}
              </button>
              <button
                onClick={() => window.open('https://bitsaveapi.vercel.app/transactions/currency/usdglo', '_blank')}
                className="px-4 py-2 text-white rounded-md text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#81D7B4' }}
              >
                OPTIONS
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-white rounded-md text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#81D7B4' }}
              >
                GET
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-6 py-4 border-b" style={{ borderColor: '#81D7B4', background: 'linear-gradient(135deg, #81D7B4/10, #81D7B4/5)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#81D7B4' }}>Filter by Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#81D7B4', '--tw-ring-color': '#81D7B4' } as React.CSSProperties}
                  >
                    <option value="">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#81D7B4' }}>Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#81D7B4', '--tw-ring-color': '#81D7B4' } as React.CSSProperties}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterStatus('');
                  }}
                  className="px-4 py-2 text-white rounded-md text-sm transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#81D7B4' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <div className="px-6 py-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#81D7B4' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Deposits</p>
                    <p className="text-2xl font-bold text-gray-900">${data?.results?.filter(tx => (tx.transaction_type || tx.type) !== 'withdrawal').reduce((sum, tx) => sum + (parseFloat(String(tx.amount)) || 0), 0).toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#81D7B4' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Results</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.results?.length || (Array.isArray(rawResponse) ? rawResponse.length : 0)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#81D7B4' }}>
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Currency</p>
                    <p className="text-2xl font-bold text-gray-900">USDGLO</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Results */}
            {data?.results && data.results.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4" style={{ color: '#81D7B4' }}>Transaction Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ borderColor: '#81D7B4' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #81D7B4/10, #81D7B4/5)' }}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>Hash</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#81D7B4' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.results
                        .filter(transaction => !filterType || (transaction.transaction_type || transaction.type)?.toLowerCase().includes(filterType.toLowerCase()))
                        .filter(() => !filterStatus || 'completed'.includes(filterStatus.toLowerCase()))
                        .map((transaction: Transaction, index) => (
                          <tr key={transaction.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.id || `tx-${index}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.amount || 'N/A'} {transaction.currency || 'USDGLO'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {transaction.txnhash ? (
                                <button
                                  onClick={() => window.open(`https://celoscan.io/tx/${transaction.txnhash}`, '_blank')}
                                  className="px-3 py-1 text-xs font-medium rounded-full text-white transition-colors hover:opacity-80"
                                  style={{ backgroundColor: '#81D7B4' }}
                                >
                                  View Hash
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">No hash</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(transaction.transaction_type || transaction.type) === 'deposit' ? 'bg-green-100 text-green-800' :
                                  (transaction.transaction_type || transaction.type) === 'withdrawal' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {transaction.transaction_type || transaction.type || 'unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                completed
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : (transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw JSON Response */}
            <div className="mb-4">
              <button
                onClick={() => {
                  const jsonElement = document.getElementById('json-response');
                  if (jsonElement) {
                    jsonElement.style.display = jsonElement.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Toggle Raw JSON
              </button>
            </div>
            <div id="json-response" className="bg-gray-900 rounded-lg p-4 overflow-auto" style={{ display: 'none' }}>
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(rawResponse || data, null, 2)}
              </pre>
            </div>

            {/* Pagination Info */}
            {(data?.next || data?.previous) && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {data.previous && (
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">← Previous</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {data.next && (
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Next →</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
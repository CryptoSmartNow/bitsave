'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { LinkSquare01Icon, Activity01Icon, ArrowRight01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import Link from 'next/link';

type Endpoint = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  requiresPayload: boolean;
  defaultPayload?: string;
};

const ENDPOINTS: Endpoint[] = [
  { id: 'stats', method: 'GET', path: '/api/v1/bizbond/stats', requiresPayload: false },
  { id: 'rates', method: 'GET', path: '/api/v1/bizbond/rates', requiresPayload: false },
  { id: 'cert-wallet', method: 'GET', path: '/api/v1/bizbond/certificates/[walletAddress]', requiresPayload: false },
  { id: 'cert-detail', method: 'GET', path: '/api/v1/bizbond/certificates/detail/[certificateId]', requiresPayload: false },
  { id: 'deposit-get', method: 'GET', path: '/api/v1/bizbond/deposit/[depositId]', requiresPayload: false },
  { 
    id: 'deposit-post', 
    method: 'POST', 
    path: '/api/v1/bizbond/deposit', 
    requiresPayload: true,
    defaultPayload: JSON.stringify({
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      amount: 1000,
      chain: "BASE",
      token: "USDC",
      instrument: "BizBond"
    }, null, 2)
  },
  { 
    id: 'mint', 
    method: 'POST', 
    path: '/api/v1/bizbond/mint', 
    requiresPayload: true,
    defaultPayload: JSON.stringify({
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      chainrailsSessionId: "sess_abc123",
      chain: "BASE"
    }, null, 2)
  },
  { 
    id: 'redeem', 
    method: 'POST', 
    path: '/api/v1/bizbond/redeem', 
    requiresPayload: true,
    defaultPayload: JSON.stringify({
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      certificateId: "cert_123",
      chain: "BASE"
    }, null, 2)
  },
  { 
    id: 'claim', 
    method: 'POST', 
    path: '/api/v1/bizbond/claim', 
    requiresPayload: true,
    defaultPayload: JSON.stringify({
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      certificateId: "cert_123",
      chain: "BASE"
    }, null, 2)
  },
];

// Helper to extract param names (e.g., "[walletAddress]" -> "walletAddress")
const extractParams = (path: string) => {
  const matches = path.match(/\[([^\]]+)\]/g);
  return matches ? matches.map(m => m.replace(/[\[\]]/g, '')) : [];
};

export default function ApiPlayground() {
  const [apiKey, setApiKey] = useState('');
  const [env, setEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  
  // State for dynamic path parameters
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [payload, setPayload] = useState(ENDPOINTS[0].defaultPayload || '');
  
  const [response, setResponse] = useState<{ status: number; data: any; timeMs: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);

  const handleEndpointChange = (id: string) => {
    const ep = ENDPOINTS.find((e) => e.id === id)!;
    setSelectedEndpoint(ep);
    setPayload(ep.defaultPayload || '');
    setResponse(null);
    
    // Reset params
    const params = extractParams(ep.path);
    const newParams: Record<string, string> = {};
    params.forEach(p => newParams[p] = '');
    setPathParams(newParams);
  };

  const handleParamChange = (param: string, value: string) => {
    setPathParams(prev => ({ ...prev, [param]: value }));
  };

  const getConstructedUrl = () => {
    let url = selectedEndpoint.path;
    Object.entries(pathParams).forEach(([key, val]) => {
      url = url.replace(`[${key}]`, val || `[${key}]`);
    });
    return url;
  };

  const handleSendRequest = async () => {
    if (!apiKey) {
      toast.error('Please provide an API Key');
      return;
    }

    const constructedPath = getConstructedUrl();
    if (constructedPath.includes('[')) {
      toast.error('Please fill in all path parameters');
      return;
    }

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      let parsedPayload = undefined;
      if (selectedEndpoint.requiresPayload && payload) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch (e) {
          toast.error('Invalid JSON payload');
          setIsLoading(false);
          return;
        }
      }

      // For local testing, we hit the relative path (sandbox) or hardcode production if env === 'production'
      const baseUrl = env === 'sandbox' ? '' : 'https://bitsave.io';
      
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'x-api-key': apiKey.trim(),
          ...(selectedEndpoint.requiresPayload && { 'Content-Type': 'application/json' })
        }
      };

      if (parsedPayload) {
        options.body = JSON.stringify(parsedPayload);
      }

      const res = await fetch(`${baseUrl}${constructedPath}`, options);
      
      const endTime = Date.now();
      const timeMs = endTime - startTime;

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Failed to parse JSON response' };
      }

      setResponse({
        status: res.status,
        data,
        timeMs
      });

      if (res.ok) {
        toast.success(`Request successful (${timeMs}ms)`);
      } else {
        toast.error(`Request failed with status ${res.status}`);
      }

    } catch (error: any) {
      setResponse({
        status: 0,
        data: { error: error.message || 'Network request failed' },
        timeMs: Date.now() - startTime
      });
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const requiredParams = extractParams(selectedEndpoint.path);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-[#81D7B4]/30 selection:text-white flex flex-col">
      {/* Premium Header */}
      <header className="flex-none h-16 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dev-admin" className="text-[#81D7B4] hover:text-white transition-colors">
            <ArrowRight01Icon className="w-5 h-5 rotate-180" />
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-white leading-none mb-1">Developer API Explorer</h1>
              <p className="text-[10px] text-[#7B8B9A] uppercase tracking-widest leading-none">Bitsave Enterprise</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#333333]/50 border border-[#333333] hover:border-[#81D7B4]/50 transition-colors text-xs font-bold"
            >
              <div className={`w-2 h-2 rounded-full ${env === 'sandbox' ? 'bg-amber-400' : 'bg-[#81D7B4]'} animate-pulse`} />
              {env === 'sandbox' ? 'Sandbox' : 'Production'}
            </button>
            {isEnvDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden shadow-2xl z-50">
                <button
                  onClick={() => { setEnv('sandbox'); setIsEnvDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-[#81D7B4]/10 hover:text-[#81D7B4] flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  Sandbox
                </button>
                <button
                  onClick={() => { setEnv('production'); setIsEnvDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-[#81D7B4]/10 hover:text-[#81D7B4] flex items-center gap-2 border-t border-[#333333]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#81D7B4]" />
                  Production
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Split Pane Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Configuration */}
        <div className="w-1/2 flex flex-col border-r border-[#333333] bg-[#121212] overflow-y-auto custom-scrollbar relative">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Request Config</h2>
              <p className="text-sm text-[#7B8B9A]">Configure your API request, headers, and payload.</p>
            </div>

            <div className="space-y-8">
              {/* Authentication */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Authentication</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#4B5A75] text-sm font-mono">x-api-key</span>
                  </div>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-24 pr-4 py-3 text-sm font-mono text-[#81D7B4] focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <hr className="border-[#333333]" />

              {/* Endpoint Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Endpoint Target</label>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-sm font-mono text-white text-left focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all flex justify-between items-center group shadow-inner"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`font-bold ${selectedEndpoint.method === 'GET' ? 'text-blue-400' : 'text-[#81D7B4]'}`}>
                        {selectedEndpoint.method}
                      </span>
                      <span>{selectedEndpoint.path}</span>
                    </span>
                    <svg className={`w-4 h-4 transition-transform text-[#4B5A75] group-hover:text-white ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#333333] rounded-xl overflow-hidden z-20 shadow-2xl">
                      {ENDPOINTS.map((ep, i) => (
                        <button
                          key={ep.id}
                          type="button"
                          onClick={() => { handleEndpointChange(ep.id); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-mono text-white hover:bg-[#81D7B4]/10 transition-colors flex gap-3 items-center ${i > 0 ? 'border-t border-[#333333]/50' : ''}`}
                        >
                          <span className={`font-bold w-10 ${ep.method === 'GET' ? 'text-blue-400' : 'text-[#81D7B4]'}`}>{ep.method}</span>
                          <span className="truncate">{ep.path}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Computed URL Preview */}
                <div className="mt-3 p-3 rounded-lg bg-[#1A1A1A]/50 border border-[#333333]/50 flex items-center gap-2">
                  <span className="text-[10px] text-[#4B5A75] uppercase font-bold">Target URL:</span>
                  <span className="text-xs font-mono text-[#7B8B9A] break-all">{env === 'sandbox' ? 'http://localhost:3000' : 'https://bitsave.io'}{getConstructedUrl()}</span>
                </div>
              </div>

              {/* Dynamic Path Parameters */}
              {requiredParams.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3">Path Parameters</label>
                  <div className="space-y-3">
                    {requiredParams.map(param => (
                      <div key={param} className="flex items-center gap-3">
                        <div className="w-1/3 text-right">
                          <span className="text-xs font-mono text-[#4B5A75]">{param}</span>
                        </div>
                        <input
                          type="text"
                          value={pathParams[param] || ''}
                          onChange={(e) => handleParamChange(param, e.target.value)}
                          placeholder={`Enter ${param}`}
                          className="w-2/3 bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/50 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payload Body */}
              {selectedEndpoint.requiresPayload && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">JSON Body</label>
                    <span className="text-[10px] bg-[#333333] text-[#7B8B9A] px-2 py-0.5 rounded font-mono">application/json</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#333333] focus-within:border-[#81D7B4] focus-within:ring-1 focus-within:ring-[#81D7B4]/50 transition-all">
                    <textarea
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      className="w-full h-48 bg-[#1A1A1A] text-[#81D7B4] font-mono text-sm p-4 focus:outline-none resize-none custom-scrollbar"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
          
          {/* Sticky Send Button at Bottom */}
          <div className="sticky bottom-0 left-0 w-full px-8 pb-8 pt-12 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] disabled:bg-[#333333] disabled:text-[#4B5A75] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(129,215,180,0.2)] hover:shadow-[0_0_30px_rgba(129,215,180,0.4)] disabled:shadow-none flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing Request...
                  </>
                ) : (
                  <>
                    <span className="text-sm uppercase tracking-wider">Send API Request</span>
                    <ArrowRight01Icon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Response Viewer */}
        <div className="w-1/2 bg-[#1A1A1A] flex flex-col border-l border-[#121212] relative">
          {/* Response Header */}
          <div className="h-14 border-b border-[#333333] flex items-center justify-between px-6 bg-[#121212]/50 backdrop-blur-md absolute top-0 w-full z-10">
            <span className="text-xs font-bold text-[#7B8B9A] uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Console Output
            </span>
            {response && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#4B5A75] uppercase font-bold">Status</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${response.status >= 200 && response.status < 300 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {response.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#4B5A75] uppercase font-bold">Time</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{response.timeMs}ms</span>
                </div>
              </div>
            )}
          </div>

          {/* Response Body */}
          <div className="flex-1 pt-14 p-6 overflow-y-auto custom-scrollbar">
            {response ? (
              <pre className="text-sm font-mono leading-relaxed">
                <code 
                  className="block p-4"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(response.data, null, 2)
                      .replace(/("[^"]+"):/g, '<span class="text-blue-300">$1</span>:')
                      .replace(/: ("[^"]+")/g, ': <span class="text-emerald-300">$1</span>')
                      .replace(/: ([0-9]+)/g, ': <span class="text-amber-400">$1</span>')
                      .replace(/: (true|false)/g, ': <span class="text-purple-400">$1</span>')
                      .replace(/: (null)/g, ': <span class="text-gray-500">$1</span>')
                  }}
                />
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#4B5A75] opacity-50">
                <CheckmarkCircle01Icon className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-mono text-sm">Hit Send to view response</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #121212;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4B5A75;
        }
      `}</style>
    </div>
  );
}

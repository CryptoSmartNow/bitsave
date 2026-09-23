"use client";

import { useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { ChevronRight, FileText, CheckCircle2, Play, Loader2 } from 'lucide-react';

const endpoints = [
  {
    id: 'rates',
    method: 'GET',
    path: '/api/v1/bizbond/rates',
    name: 'Get Rates',
    description: 'Returns the list of available BizBond instruments, current APR, payout frequency, and vesting periods.',
    requestParams: [],
    requestBody: null,
    response: {
      success: true,
      data: [
        {
          instrument: 'BizBond',
          description: 'Treasury Backed Pool',
          apr: '10% Fixed',
          payoutFrequency: 'Quarterly',
          vestingPeriodDays: 90,
          typeIndex: 2,
          available: true
        }
      ]
    }
  },
  {
    id: 'deposit',
    method: 'POST',
    path: '/api/v1/bizbond/deposit',
    name: 'Initialize Deposit',
    description: 'Creates a new deposit intent and returns a Chainrails session object to be used by the frontend widget. Minimum deposit amount is $1,000.',
    requestParams: [],
    requestBody: {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 1000,
      chain: 'BASE',
      instrument: 'BizBond'
    },
    response: {
      success: true,
      data: {
        session: {
          session_id: 'crs_12345abcde',
          url: 'https://pay.chainrails.com/...'
        }
      }
    }
  },
  {
    id: 'deposit-status',
    method: 'GET',
    path: '/api/v1/bizbond/deposit/{depositId}',
    name: 'Check Deposit Status',
    description: 'Retrieve the current status and details of a deposit by its internal ID. Use to check if a Chainrails payment has been confirmed.',
    requestParams: [
      { name: 'depositId', type: 'string', required: true, description: 'Internal deposit ID' }
    ],
    requestBody: null,
    response: {
      success: true,
      data: {
        depositId: 'dep_987xyz',
        status: 'completed',
        amount: 1000,
        instrument: 'BizBond'
      }
    }
  },
  {
    id: 'mint',
    method: 'POST',
    path: '/api/v1/bizbond/mint',
    name: 'Initiate Minting',
    description: 'Verifies the deposit and returns the unsigned transaction payload necessary to mint the certificate on-chain (Non-custodial).',
    requestParams: [],
    requestBody: {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chainrailsSessionId: 'crs_12345abcde'
    },
    response: {
      success: true,
      message: 'Ready to mint. Please sign the transaction.',
      data: {
        certificateId: 'cert_abc123',
        contractAddress: '0xDef...456',
        methodName: 'mintCertificate',
        args: ['0x123...abc', 100000, 0, 0, 2, 'https://...']
      }
    }
  },
  {
    id: 'claim',
    method: 'POST',
    path: '/api/v1/bizbond/claim',
    name: 'Claim Yield',
    description: 'Generates the unsigned transaction payload required for a user to claim their accrued yield on a specific certificate.',
    requestParams: [],
    requestBody: {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      certificateId: 'cert_abc123'
    },
    response: {
      success: true,
      message: 'Ready to claim yield.',
      data: {
        certificateId: 'cert_abc123',
        contractAddress: '0xDef...456',
        methodName: 'claimYield',
        args: ['cert_abc123']
      }
    }
  },
  {
    id: 'portfolio',
    method: 'GET',
    path: '/api/v1/bizbond/certificates/{walletAddress}',
    name: 'Get Portfolio',
    description: 'Retrieve a list of all BizBond certificates owned by the specified wallet address.',
    requestParams: [
      { name: 'walletAddress', type: 'string', required: true, description: 'User wallet address' }
    ],
    requestBody: null,
    response: {
      success: true,
      data: [
        {
          instrument: 'BizBond',
          investmentAmount: 1000,
          status: 'Active',
          apr: '10% Fixed',
          mintAddress: 'cert_abc123'
        }
      ]
    }
  },
  {
    id: 'details',
    method: 'GET',
    path: '/api/v1/bizbond/certificates/detail/{certificateId}',
    name: 'Get Certificate Details',
    description: 'Retrieve detailed metadata, current accrued yield, and maturity date for a specific bond certificate.',
    requestParams: [
      { name: 'certificateId', type: 'string', required: true, description: 'Unique ID of the bond certificate' }
    ],
    requestBody: null,
    response: {
      success: true,
      data: {
        mintAddress: 'cert_abc123',
        wallet: '0x123...456',
        investmentAmount: 1000,
        accruedYield: 45.2,
        maturityDate: '2026-12-31T00:00:00.000Z',
        status: 'Active'
      }
    }
  },
  {
    id: 'redeem',
    method: 'POST',
    path: '/api/v1/bizbond/redeem',
    name: 'Redeem Bond',
    description: 'Generates the unsigned transaction payload required for a user to burn their matured bond and withdraw their principal + final yield.',
    requestParams: [],
    requestBody: {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      certificateId: 'cert_abc123'
    },
    response: {
      success: true,
      message: 'Ready to redeem bond principal and final yield.',
      data: {
        certificateId: 'cert_abc123',
        contractAddress: '0xDef...456',
        methodName: 'redeemBond',
        args: ['cert_abc123']
      }
    }
  },
  {
    id: 'stats',
    method: 'GET',
    path: '/api/v1/bizbond/stats',
    name: 'Get Protocol Stats',
    description: 'Retrieve aggregated protocol metrics such as Total Value Locked (TVL) and total active bonds. Great for integrator dashboards.',
    requestParams: [],
    requestBody: null,
    response: {
      success: true,
      data: {
        tvlUsd: 1540000,
        totalYieldDistributedUsd: 125000,
        activeBonds: 320,
        apyRange: '10% - 16%',
        defaultRate: '0.00%',
        lastUpdated: '2026-09-22T12:00:00.000Z'
      }
    }
  }
];

export default function PremiumApiDocs() {
  const [activeEndpointId, setActiveEndpointId] = useState(endpoints[0].id);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Playground State
  const [activeTab, setActiveTab] = useState<'example' | 'playground'>('example');
  const [apiKey, setApiKey] = useState('');
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [reqBodyStr, setReqBodyStr] = useState('');
  const [testResponse, setTestResponse] = useState<{ status: number | string, data: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeEndpoint = endpoints.find(e => e.id === activeEndpointId) || endpoints[0];

  useEffect(() => {
    // Reset playground state when endpoint changes
    setTestResponse(null);
    if (activeEndpoint.requestBody) {
      setReqBodyStr(JSON.stringify(activeEndpoint.requestBody, null, 2));
    } else {
      setReqBodyStr('');
    }
    const initialParams: Record<string, string> = {};
    activeEndpoint.requestParams.forEach(p => {
      initialParams[p.name] = '';
    });
    setPathParams(initialParams);
  }, [activeEndpointId]);

  const copyToClipboard = (text: string, keyId?: string) => {
    navigator.clipboard.writeText(text);
    if (keyId) {
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateCurl = (endpoint: any) => {
    let curl = `curl -X ${endpoint.method} https://bitsave.io${endpoint.path} \\
  -H "x-api-key: YOUR_API_KEY"`;
    
    if (endpoint.requestBody) {
      curl += ` \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
    }
    return curl;
  };

  const handleTestRequest = async () => {
    setIsLoading(true);
    setTestResponse(null);
    
    let finalPath = activeEndpoint.path;
    for (const [key, val] of Object.entries(pathParams)) {
      finalPath = finalPath.replace(`{${key}}`, val as string);
    }

    try {
      const options: RequestInit = {
        method: activeEndpoint.method,
        headers: {
          'x-api-key': apiKey || '',
        }
      };
      
      if (activeEndpoint.requestBody) {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
        options.body = reqBodyStr;
      }

      const res = await fetch(finalPath, options);
      const data = await res.json().catch(() => null);
      
      setTestResponse({
        status: res.status,
        data: data || { error: 'No JSON response' }
      });
    } catch (err: any) {
      setTestResponse({
        status: 'Error',
        data: { error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CodeSnippet = ({ code, language }: { code: string, language: string }) => (
    <Highlight theme={themes.vsDark} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} font-dank-mono text-xs md:text-sm p-4 overflow-x-auto`} style={{ ...style, backgroundColor: 'transparent' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  return (
    <div className="flex h-screen bg-[#121212] text-[#EDEDED] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-[280px] flex-shrink-0 border-r border-[#333] bg-[#121212] overflow-y-auto">
        <div className="px-6 py-6 border-b border-[#333]">
          <h1 className="text-sm font-semibold tracking-wide">BizBond API</h1>
          <p className="text-xs text-[#888] mt-1">v1.1.0 Reference</p>
        </div>
        
        <div className="px-4 py-6">
          <h3 className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-3 px-2">Endpoints</h3>
          <ul className="space-y-0.5">
            {endpoints.map((ep) => {
              const isActive = activeEndpointId === ep.id;
              return (
                <li key={ep.id}>
                  <button
                    onClick={() => setActiveEndpointId(ep.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-all border-l-2 ${
                      isActive 
                        ? 'bg-[#1A1A1A] text-white font-bold border-[#81D7B4]' 
                        : 'text-[#888] hover:text-[#EDEDED] hover:bg-[#1A1A1A] border-transparent'
                    }`}
                  >
                    <span>{ep.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      ep.method === 'GET' ? 'text-blue-400 bg-blue-400/10' : 'text-[#81D7B4] bg-[#81D7B4]/10'
                    }`}>
                      {ep.method}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 px-2">
            <div className="bg-[#1A1A1A] border border-amber-900/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Security Notice</h3>
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                CORS is strictly disabled. API requests must originate from your secure backend servers to protect your API keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Code Snippets */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* API Description Panel */}
        <div className="flex-1 overflow-y-auto p-10 xl:p-16 custom-scrollbar bg-[#121212]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono text-[#888] bg-[#1A1A1A] px-2 py-1 rounded border border-[#333]">
                {activeEndpoint.method}
              </span>
              <h2 className="text-2xl font-semibold text-white tracking-tight">{activeEndpoint.name}</h2>
            </div>
            
            <p className="text-[#A3A3A3] text-sm leading-relaxed mb-10">
              {activeEndpoint.description}
            </p>

            {/* Authentication */}
            <div className="mb-12">
              <h3 className="text-sm font-medium text-white mb-4 border-b border-[#333] pb-2">Authentication</h3>
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-[#222]">
                  <span className="text-sm font-mono text-[#EDEDED]">x-api-key</span>
                  <span className="text-xs text-[#888]">Header</span>
                </div>
                <p className="text-xs text-[#888] mt-2">Required for all requests. Provide your BizBond developer API key.</p>
              </div>

              <h4 className="text-xs font-bold text-white mb-3">Sandbox Testing Keys</h4>
              <p className="text-xs text-[#A3A3A3] mb-4 leading-relaxed">
                Use the following keys in the Playground to simulate different integration scenarios and permissions:
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="bg-[#1A1A1A] border border-[#333] rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#81D7B4]">test_sandbox_standard</span>
                      <span className="text-[10px] bg-[#333] text-white px-1.5 py-0.5 rounded">Full Access</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('test_sandbox_standard', 'standard')}
                      className="text-[10px] uppercase font-bold tracking-wider text-[#888] hover:text-[#EDEDED] bg-[#222] hover:bg-[#333] border border-[#333] px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 w-[95px] flex-shrink-0 whitespace-nowrap"
                    >
                      {copiedKey === 'standard' ? <><CheckCircle2 className="w-2.5 h-2.5 text-[#81D7B4]" /> Copied</> : <><FileText className="w-2.5 h-2.5" /> Copy Key</>}
                    </button>
                  </div>
                  <p className="text-xs text-[#888]">Simulates a standard third-party integration. Can test all GET and POST (mint/deposit) endpoints successfully.</p>
                </div>
                
                <div className="bg-[#1A1A1A] border border-[#333] rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#81D7B4]">test_sandbox_readonly</span>
                      <span className="text-[10px] bg-[#333] text-white px-1.5 py-0.5 rounded">Read-Only</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('test_sandbox_readonly', 'readonly')}
                      className="text-[10px] uppercase font-bold tracking-wider text-[#888] hover:text-[#EDEDED] bg-[#222] hover:bg-[#333] border border-[#333] px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 w-[95px] flex-shrink-0 whitespace-nowrap"
                    >
                      {copiedKey === 'readonly' ? <><CheckCircle2 className="w-2.5 h-2.5 text-[#81D7B4]" /> Copied</> : <><FileText className="w-2.5 h-2.5" /> Copy Key</>}
                    </button>
                  </div>
                  <p className="text-xs text-[#888]">Simulates a Tracker/Dashboard integration. Attempting to use POST endpoints (mint/deposit/claim) will return a 403 Forbidden error.</p>
                </div>

                <div className="bg-[#1A1A1A] border border-[#333] rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#81D7B4]">test_sandbox_suspended</span>
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Suspended</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('test_sandbox_suspended', 'suspended')}
                      className="text-[10px] uppercase font-bold tracking-wider text-[#888] hover:text-[#EDEDED] bg-[#222] hover:bg-[#333] border border-[#333] px-2 py-0.5 rounded transition-colors flex items-center justify-center gap-1 w-[95px] flex-shrink-0 whitespace-nowrap"
                    >
                      {copiedKey === 'suspended' ? <><CheckCircle2 className="w-2.5 h-2.5 text-[#81D7B4]" /> Copied</> : <><FileText className="w-2.5 h-2.5" /> Copy Key</>}
                    </button>
                  </div>
                  <p className="text-xs text-[#888]">Simulates an account suspended due to unpaid invoices. All requests will be instantly rejected.</p>
                </div>
              </div>
            </div>

            {/* Path Parameters */}
            {activeEndpoint.requestParams.length > 0 && (
              <div className="mb-12">
                <h3 className="text-sm font-medium text-white mb-4 border-b border-[#333] pb-2">Path Parameters</h3>
                <div className="flex flex-col">
                  {activeEndpoint.requestParams.map((param, i) => (
                    <div key={i} className="flex flex-col py-3 border-b border-[#222]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-[#EDEDED]">{param.name}</span>
                          {param.required && <span className="text-[10px] uppercase tracking-wider text-red-400 font-semibold">Required</span>}
                        </div>
                        <span className="text-xs font-mono text-[#666]">{param.type}</span>
                      </div>
                      <span className="text-xs text-[#888]">{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body Parameters */}
            {activeEndpoint.requestBody && (
              <div className="mb-12">
                <h3 className="text-sm font-medium text-white mb-4 border-b border-[#333] pb-2">Request Body</h3>
                <div className="flex flex-col">
                  {Object.entries(activeEndpoint.requestBody).map(([key, val], i) => (
                    <div key={i} className="flex flex-col py-3 border-b border-[#222]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono text-[#EDEDED]">{key}</span>
                        <span className="text-xs font-mono text-[#666]">{typeof val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code / Playground Panel */}
        <div className="w-[450px] lg:w-[500px] xl:w-[600px] bg-[#1A1A1A] border-l border-[#333] overflow-y-auto custom-scrollbar flex flex-col">
          
          <div className="px-6 py-4 border-b border-[#222] flex items-center gap-2 bg-[#121212]">
            <div className="flex bg-[#1A1A1A] p-1 rounded-lg border border-[#333] w-full">
              <button
                onClick={() => setActiveTab('example')}
                className={`flex-1 text-xs font-bold uppercase tracking-wider py-2 rounded-md transition-colors ${
                  activeTab === 'example' 
                    ? 'bg-[#333] text-white shadow-sm' 
                    : 'text-[#666] hover:text-[#888]'
                }`}
              >
                Code Example
              </button>
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex-1 flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider py-2 rounded-md transition-colors ${
                  activeTab === 'playground' 
                    ? 'bg-[#81D7B4] text-[#121212] shadow-sm' 
                    : 'text-[#666] hover:text-[#888]'
                }`}
              >
                <Play className="w-3 h-3 fill-[#121212]" /> Test Endpoint
              </button>
            </div>
          </div>

          {activeTab === 'example' ? (
            <>
              <div className="relative border-b border-[#222]">
                <button 
                  onClick={() => copyToClipboard(generateCurl(activeEndpoint))}
                  className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors bg-[#222] p-1.5 rounded border border-[#333] flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#81D7B4]" /> : <FileText className="w-3.5 h-3.5" />}
                </button>
                <div className="p-2">
                  <CodeSnippet code={generateCurl(activeEndpoint)} language="bash" />
                </div>
              </div>

              <div className="p-6 pb-2 mt-4 border-b border-[#222] flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Example Response</h4>
                <div className="flex items-center gap-1.5 bg-[#222] border border-[#333] px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></span>
                  <span className="text-[10px] font-mono text-[#888]">200 OK</span>
                </div>
              </div>
              <div className="p-2">
                <CodeSnippet code={JSON.stringify(activeEndpoint.response, null, 2)} language="json" />
              </div>
            </>
          ) : (
            <div className="flex flex-col p-6 gap-6">
              <div>
                <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">API Key</label>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter a test key (e.g. test_sandbox_standard)"
                  className="w-full bg-[#222] border border-[#333] rounded text-sm px-3 py-2 text-white outline-none focus:border-[#81D7B4] transition-colors font-mono"
                />
              </div>

              {activeEndpoint.requestParams.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Path Parameters</label>
                  <div className="space-y-3">
                    {activeEndpoint.requestParams.map((param) => (
                      <div key={param.name}>
                        <div className="text-xs font-mono text-[#A3A3A3] mb-1">{param.name}</div>
                        <input 
                          type="text" 
                          value={pathParams[param.name] || ''}
                          onChange={e => setPathParams({...pathParams, [param.name]: e.target.value})}
                          placeholder={`${param.type}`}
                          className="w-full bg-[#222] border border-[#333] rounded text-sm px-3 py-2 text-white outline-none focus:border-[#81D7B4] transition-colors font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeEndpoint.requestBody && (
                <div>
                  <label className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2 block">Request Body (JSON)</label>
                  <textarea 
                    value={reqBodyStr}
                    onChange={e => setReqBodyStr(e.target.value)}
                    rows={8}
                    className="w-full bg-[#222] border border-[#333] rounded text-sm px-3 py-2 text-[#81D7B4] outline-none focus:border-[#81D7B4] transition-colors font-dank-mono custom-scrollbar"
                  />
                </div>
              )}

              <button 
                onClick={handleTestRequest}
                disabled={isLoading}
                className="w-full bg-[#81D7B4] text-[#121212] font-semibold rounded py-2.5 mt-2 flex items-center justify-center gap-2 hover:bg-[#6BC7A0] transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-[#121212]" />}
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>

              {testResponse && (
                <div className="mt-6 border-t border-[#333] pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Live Response</h4>
                    <div className={`flex items-center gap-1.5 bg-[#222] border border-[#333] px-2 py-0.5 rounded`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${testResponse.status === 200 ? 'bg-[#81D7B4]' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] font-mono text-[#888]">{testResponse.status}</span>
                    </div>
                  </div>
                  <div className="bg-[#121212] border border-[#333] rounded overflow-hidden">
                    <CodeSnippet code={JSON.stringify(testResponse.data, null, 2)} language="json" />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.cdnfonts.com/css/dank-mono');
        
        .font-dank-mono {
          font-family: 'Dank Mono', 'Fira Code', Consolas, monospace !important;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}} />
    </div>
  );
}

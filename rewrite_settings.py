import re

with open('app/dashboard/settings/page.tsx', 'r') as f:
    content = f.read()

# The logic ends right before `return (`
logic_end_index = content.find('  return (\n    <div className={`${exo.variable}')
if logic_end_index == -1:
    print("Could not find start of JSX")
    exit(1)

logic_part = content[:logic_end_index]

# Add missing imports to the logic part
if 'import ThemeSelector' not in logic_part:
    logic_part = logic_part.replace("import { PageShimmer } from '@/components/ShimmerLoading';", "import { PageShimmer } from '@/components/ShimmerLoading';\nimport ThemeSelector from '@/components/ThemeSelector';")

if 'UserCircleIcon' not in logic_part:
    logic_part = logic_part.replace('UserMultipleIcon } from "hugeicons-react";', 'UserMultipleIcon, UserCircleIcon, Settings01Icon, SparklesIcon, PaintBoardIcon } from "hugeicons-react";')

new_state_additions = """
  // AI Widget Toggle State
  const [showAiWidget, setShowAiWidget] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('showAiWidget');
    if (saved === 'false') setShowAiWidget(false);
  }, []);

  const toggleAiWidget = () => {
    const newState = !showAiWidget;
    setShowAiWidget(newState);
    localStorage.setItem('showAiWidget', String(newState));
    window.dispatchEvent(new CustomEvent('toggleAiWidget', { detail: { show: newState } }));
  };

  const SETTINGS_CATEGORIES = [
    { id: 'Profile', label: 'General Profile', icon: UserCircleIcon },
    { id: 'Security', label: 'Security & Contacts', icon: Activity01Icon },
    { id: 'Preferences', label: 'Preferences', icon: Settings01Icon },
    { id: 'Appearance', label: 'Appearance', icon: SparklesIcon },
  ];
"""

# Insert new state additions before the `if (!mounted)` check
mounted_check_index = logic_part.find('  if (!mounted) {')
logic_part = logic_part[:mounted_check_index] + new_state_additions + logic_part[mounted_check_index:]

jsx_part = """  return (
    <div className={`${exo.variable} font-sans relative min-h-screen bg-[#f8faf9] dark:bg-transparent overflow-hidden`}>
      <NetworkDetection />
            
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-72 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 hidden md:block tracking-tight font-instrument">Settings</h1>
          <div className="md:sticky md:top-24 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible hide-scrollbar pb-4 md:pb-0">
            {SETTINGS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedTab(cat.id as any)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all whitespace-nowrap ${
                  selectedTab === cat.id 
                    ? 'bg-white dark:bg-[#1a1a1a] text-[#0f172a] dark:text-[#81D7B4] shadow-sm border border-gray-100 dark:border-white/10' 
                    : 'text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <cat.icon className={`w-5 h-5 ${selectedTab === cat.id ? 'text-[#81D7B4]' : 'text-gray-400 dark:text-gray-500'}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden min-h-[600px]"
            >
              
              {/* PROFILE TAB */}
              {selectedTab === 'Profile' && (
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                   {/* Wallet & ENS Section */}
                   <div className="p-6 sm:p-10">
                      <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-6 tracking-tight">Wallet & Identity</h2>
                      
                      {/* Address */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-[#f8faf9] dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/20 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a2a2a] flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
                               <Activity01Icon className="w-6 h-6 text-[#81D7B4]" />
                            </div>
                            <div className="overflow-hidden">
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Wallet Address</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5 font-mono truncate">{address || 'Not connected'}</p>
                            </div>
                         </div>
                         <button onClick={copyToClipboard} className="text-[13px] font-bold text-[#0f172a] dark:text-white bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 px-5 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm shrink-0">
                           Copy
                         </button>
                      </div>

                      {/* ENS */}
                      <div className="-mx-10 px-10">
                         <ENSLinking 
                           walletAddress={address}
                           isSolanaNetwork={currentNetwork === 'solana' || (address !== undefined && !address.startsWith('0x') && address.length >= 32)}
                         />
                      </div>
                   </div>

                   {/* Socials & Display Name */}
                   <div className="p-6 sm:p-10">
                      <h2 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">Social Connections</h2>
                      <p className="text-[#64748b] dark:text-gray-400 text-[14px] mb-8 font-medium">Link your social accounts to use as your display name or enable extra features.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Twitter */}
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-white/20 transition-colors shadow-sm gap-4">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-xl">𝕏</div>
                               <div>
                                  <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Cancel (Twitter)</p>
                                  <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">{isXConnected && xUsername ? `@${xUsername}` : 'Not connected'}</p>
                               </div>
                            </div>
                            {isXConnected && xUsername ? (
                               <button onClick={handleDisconnectX} className="text-[13px] font-bold text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/30 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 px-4 py-2 rounded-xl transition-colors">Disconnect</button>
                            ) : (
                               <button onClick={handleConnectX} disabled={isConnectingX} className="text-[13px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap">
                                 {isConnectingX ? 'Connecting...' : 'Connect'}
                               </button>
                            )}
                         </div>

                         {/* Farcaster */}
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm opacity-60 grayscale cursor-not-allowed gap-4">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-[#8a63d2] text-white rounded-xl flex items-center justify-center font-bold text-sm">FC</div>
                               <div>
                                  <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Farcaster</p>
                                  <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Coming soon</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Bitsave Savvy Name */}
                   <div className="p-6 sm:p-10">
                      <h2 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">Bitsave Savvy Name</h2>
                      <p className="text-[#64748b] dark:text-gray-400 text-[14px] mb-8 font-medium max-w-2xl">Claim your unique username within the Bitsave ecosystem for peer-to-peer sharing and easier transfers.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                         <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                            <input
                              type="text"
                              value={savvyNameInput}
                              onChange={(e) => setSavvyNameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                              className="w-full pl-10 pr-20 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] dark:text-white shadow-sm transition-all bg-white dark:bg-[#2a2a2a]"
                              placeholder="your_username"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px] pointer-events-none select-none">.savvy</span>
                         </div>
                         <button
                            onClick={handleSaveSavvyName}
                            disabled={isSavingSavvyName || `${savvyNameInput}.savvy` === currentSavvyName}
                            className="px-4 sm:px-8 py-3 sm:py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] font-black rounded-xl shadow-md transition-all disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-[#333] disabled:text-gray-500 min-w-[140px]"
                         >
                            {isSavingSavvyName ? 'Saving...' : (currentSavvyName && `${savvyNameInput}.savvy` === currentSavvyName ? 'Saved' : 'Update Name')}
                         </button>
                      </div>
                      {currentSavvyName && (
                         <p className="mt-4 text-[13px] text-[#81D7B4] font-black uppercase tracking-widest flex items-center gap-1.5">
                           <Tick01Icon className="w-4 h-4" /> Active Savvy Name
                         </p>
                      )}
                   </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {selectedTab === 'Security' && (
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                   <div className="p-6 sm:p-10">
                      <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">Security & Contacts</h2>
                      <p className="text-[#64748b] dark:text-gray-400 text-[14px] mb-8 font-medium">Connect your email to receive important account alerts, security notices, and transaction receipts.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                         <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                               <Activity01Icon className="w-5 h-5" />
                            </span>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isEmailConnected}
                              placeholder="name@example.com"
                              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] dark:text-white shadow-sm transition-all bg-white dark:bg-[#2a2a2a] disabled:bg-gray-50 dark:disabled:bg-[#222] disabled:text-gray-500"
                            />
                         </div>
                         {isEmailConnected ? (
                            <div className="px-4 sm:px-8 py-3 sm:py-3.5 bg-[#81D7B4]/10 border border-[#81D7B4]/30 text-[#81D7B4] font-black rounded-xl flex items-center justify-center gap-2 min-w-[160px]">
                               <Tick01Icon className="w-5 h-5 stroke-[3]" /> Verified
                            </div>
                         ) : (
                            <button
                               onClick={handleConnectEmail}
                               disabled={!email.trim() || isConnecting}
                               className="px-4 sm:px-8 py-3 sm:py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] font-black rounded-xl shadow-md transition-all min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                               {isConnecting ? (
                                 <>
                                   <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin mr-2"></div>
                                   Sending...
                                 </>
                               ) : 'Connect Email'}
                            </button>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {selectedTab === 'Preferences' && (
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                   {/* Language */}
                   <div className="p-6 sm:p-10">
                      <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">Preferences</h2>
                      <p className="text-[#64748b] dark:text-gray-400 text-[14px] mb-8 font-medium">Select your preferred interface language. This will update the entire application.</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-[#f8faf9] dark:bg-white/5">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a2a2a] flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10">
                               <Activity01Icon className="w-6 h-6 text-[#81D7B4]" />
                            </div>
                            <div>
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Interface Language</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Currently available in select languages</p>
                            </div>
                         </div>
                         <div className="w-full sm:w-64">
                            <LanguageSelector />
                         </div>
                      </div>
                   </div>

                   {/* Notifications */}
                   <div className="p-6 sm:p-10 bg-[#f8faf9] dark:bg-transparent">
                      <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-6">Notifications</h3>
                      <div className="space-y-4 max-w-2xl">
                         <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2a2a2a] rounded-[1.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:border-[#81D7B4]/30 transition-colors cursor-pointer" onClick={() => setIsMarketingEnabled(!isMarketingEnabled)}>
                            <div>
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Marketing Announcements</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Receive news and promotional offers</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 shrink-0 ${isMarketingEnabled ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isMarketingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2a2a2a] rounded-[1.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:border-[#81D7B4]/30 transition-colors cursor-pointer" onClick={handlePushToggle}>
                            <div>
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Browser Push Notifications</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Receive alerts directly in your browser</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 shrink-0 ${isPushEnabled ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isPushEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {selectedTab === 'Appearance' && (
                <div className="divide-y divide-gray-100 dark:divide-white/10">
                   {/* Theme */}
                   <div className="p-6 sm:p-10">
                      <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">Appearance</h2>
                      <p className="text-[#64748b] dark:text-gray-400 text-[14px] mb-8 font-medium">Customize the look and feel of your Bitsave layout.</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/10 bg-[#f8faf9] dark:bg-white/5">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2a2a2a] flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
                               <SparklesIcon className="w-6 h-6 text-[#81D7B4]" />
                            </div>
                            <div>
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Color Theme</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Choose light, dark, or system default</p>
                            </div>
                         </div>
                         <div className="w-full sm:w-auto">
                            <ThemeSelector variant="segmented" />
                         </div>
                      </div>
                   </div>

                   {/* AI Widget Toggle */}
                   <div className="p-6 sm:p-10 bg-[#f8faf9] dark:bg-transparent">
                      <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-6">Widgets</h3>
                      <div className="space-y-4 max-w-2xl">
                         <div className="flex items-center justify-between p-5 bg-white dark:bg-[#2a2a2a] rounded-[1.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:border-[#81D7B4]/30 transition-colors cursor-pointer" onClick={toggleAiWidget}>
                            <div>
                               <p className="font-bold text-[#0f172a] dark:text-white text-[15px]">Show Savvy Bot Widget</p>
                               <p className="text-[13px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5">Display the floating AI assistant in the bottom right corner</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 shrink-0 ${showAiWidget ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${showAiWidget ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 sm:p-10 max-w-[400px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/10"
              >
                <div className="bg-[#81D7B4]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity01Icon className="w-8 h-8 text-[#81D7B4]" />
                </div>
                <h3 className="text-[24px] font-black text-center text-[#0f172a] dark:text-white mb-2 tracking-tight">Verify Email</h3>
                <p className="text-center text-[#64748b] dark:text-gray-400 text-[14px] font-medium mb-8 leading-relaxed">Enter the 6-digit code sent to<br/><span className="text-[#0f172a] dark:text-white font-bold">{email}</span></p>

                <div className="flex justify-between gap-2 sm:gap-3 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black text-[#0f172a] dark:text-white bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 rounded-xl outline-none transition-all shadow-inner"
                      maxLength={1}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.some(digit => !digit) || isVerifying}
                    className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] py-3.5 rounded-xl font-black tracking-wide transition-all disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 shadow-md"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0f172a] dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={isConnecting}
                    className="text-[13px] font-bold text-[#64748b] dark:text-gray-400 hover:text-[#0f172a] dark:hover:text-white transition-colors"
                  >
                    {isConnecting ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Copy Notification Toast */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-full font-bold text-[14px] shadow-xl flex items-center gap-2"
          >
            <Tick01Icon className="w-5 h-5 text-[#81D7B4]" /> Address copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
        </div>
      )}

      {/* Savvy Name Success Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 max-w-[400px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>
              
              <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6 border border-[#81D7B4]/20">
                <span className="text-3xl">🎉</span>
              </div>
              
              <h3 className="text-[24px] font-black text-[#0f172a] dark:text-white mb-2 tracking-tight">Identity Secured!</h3>
              <p className="text-[#64748b] dark:text-gray-400 text-[15px] font-medium mb-6">
                You successfully claimed <span className="font-bold text-[#81D7B4]">{currentSavvyName}</span>. Share the good news with your network!
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={getTweetButtonProps('savvy-name', { savvyName: currentSavvyName }).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black dark:bg-white dark:text-black text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on Cancel
                </a>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-[#0f172a] dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

with open('app/dashboard/settings/page.tsx', 'w') as f:
    f.write(logic_part + jsx_part)

print("Rewrote page.tsx successfully.")

import re

with open('app/dashboard/settings/page.tsx', 'r') as f:
    content = f.read()

# First we need to update the imports to include ChevronRight01Icon
# We also need to add a state for activeModal

import_pattern = r'import { Tick01Icon, Activity01Icon, Link01Icon, UserMultipleIcon, UserCircleIcon, Settings01Icon, SparklesIcon, PaintBoardIcon, Wallet01Icon } from "hugeicons-react";'
new_import = 'import { Tick01Icon, Activity01Icon, Link01Icon, UserMultipleIcon, UserCircleIcon, Settings01Icon, SparklesIcon, PaintBoardIcon, Wallet01Icon, Notification01Icon, GlobalIcon, Mail01Icon, Moon02Icon, ArrowRight01Icon } from "hugeicons-react";'

content = content.replace(import_pattern, new_import)

# Find the start of the component state variables
state_start = content.find('const [selectedTab, setSelectedTab]')
if state_start != -1:
    content = content.replace(
        "const [selectedTab, setSelectedTab] = useState<'Profile' | 'Security' | 'Preferences' | 'Appearance'>('Profile');",
        "const [activeModal, setActiveModal] = useState<'none' | 'savvyName' | 'ens' | 'socials' | 'language' | 'email'>('none');"
    )
    # Remove SETTINGS_CATEGORIES since we don't need tabs anymore
    content = re.sub(r'const SETTINGS_CATEGORIES = \[.*?\] as const;', '', content, flags=re.DOTALL)

# The logic ends right before `return (`
logic_end_index = content.find('  return (\n    <div className={`${exo.variable}')
if logic_end_index == -1:
    print("Could not find start of JSX")
    exit(1)

logic_part = content[:logic_end_index]

jsx_part = """  return (
    <div className={`${exo.variable} font-sans relative min-h-screen bg-[#fcfcf9] dark:bg-[#0f172a] overflow-x-hidden pb-24`}>
      <NetworkDetection />
      
      {/* Warm Tint Backgrounds */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-br from-[#fef3c7]/60 via-[#dcfce7]/40 to-transparent dark:from-[#fef3c7]/5 dark:via-[#dcfce7]/5 pointer-events-none blur-3xl opacity-80"></div>
      <div className="absolute -left-40 top-40 w-[600px] h-[600px] bg-[#81D7B4]/10 dark:bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <h1 className="text-3xl sm:text-[34px] font-black text-gray-900 dark:text-white mb-10 tracking-tight font-instrument">Settings</h1>

        {/* ACCOUNT OVERVIEW */}
        <div className="mb-12">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 pl-1">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
             {/* Wallet Address */}
             <div 
               onClick={copyToClipboard}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-[#81D7B4]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Wallet01Icon className="w-[22px] h-[22px] text-[#22c55e]" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Wallet Address</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{address || 'Not connected'}</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <div className="text-[12px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Copy</div>
               </div>
             </div>

             {/* Savvy Name */}
             <div 
               onClick={() => setActiveModal('savvyName')}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <UserCircleIcon className="w-[22px] h-[22px] text-blue-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Bitsave Savvy Name</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{currentSavvyName || 'Claim your username'}</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
               </div>
             </div>

             {/* Social Connections */}
             <div 
               onClick={() => setActiveModal('socials')}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <UserMultipleIcon className="w-[22px] h-[22px] text-purple-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Social Connections</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{isXConnected && xUsername ? `@${xUsername}` : 'Link social accounts'}</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
               </div>
             </div>

             {/* ENS Linking */}
             <div 
               onClick={() => setActiveModal('ens')}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Link01Icon className="w-[22px] h-[22px] text-orange-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">ENS Identity</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Link your Ethereum Name Service</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
               </div>
             </div>
          </div>
        </div>

        {/* SECURITY & CONTACT */}
        <div className="mb-12">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 pl-1">Security & Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
             {/* Email Verification */}
             <div 
               onClick={() => setActiveModal('email')}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Mail01Icon className="w-[22px] h-[22px] text-rose-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Email Verification</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{isEmailConnected ? 'Verified' : 'Connect your email'}</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
               </div>
             </div>
          </div>
        </div>

        {/* PREFERENCES & DISPLAY */}
        <div className="mb-12">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4 pl-1">Preferences & Display</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
             {/* Dark Mode */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                   <Moon02Icon className="w-[22px] h-[22px] text-pink-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Color Theme</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Switch between light and dark</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ThemeSelector variant="icon" />
               </div>
             </div>

             {/* Interface Language */}
             <div 
               onClick={() => setActiveModal('language')}
               className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#81D7B4]/40 cursor-pointer group"
             >
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <GlobalIcon className="w-[22px] h-[22px] text-teal-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Language</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Select interface language</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
               </div>
             </div>

             {/* AI Widget */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group" onClick={toggleAiWidget}>
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <PaintBoardIcon className="w-[22px] h-[22px] text-cyan-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Savvy Bot Widget</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Show AI assistant in corner</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 ${showAiWidget ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${showAiWidget ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             </div>

             {/* Marketing Notifications */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group" onClick={() => setIsMarketingEnabled(!isMarketingEnabled)}>
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Notification01Icon className="w-[22px] h-[22px] text-indigo-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Announcements</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Receive news and offers</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 ${isMarketingEnabled ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isMarketingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             </div>

             {/* Push Notifications */}
             <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group" onClick={handlePushToggle}>
               <div className="flex items-center gap-4 truncate">
                 <div className="w-11 h-11 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                   <Activity01Icon className="w-[22px] h-[22px] text-violet-500" />
                 </div>
                 <div className="truncate">
                   <h3 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">Push Alerts</h3>
                   <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Receive browser notifications</p>
                 </div>
               </div>
               <div className="shrink-0 flex items-center justify-end">
                 <div className={`w-12 h-6 rounded-full shadow-inner transition-colors flex items-center px-1 ${isPushEnabled ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isPushEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* GLOBAL MODALS */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal('none'); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-6 sm:p-8 max-w-[500px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <button onClick={() => setActiveModal('none')} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                 &times;
              </button>

              {activeModal === 'savvyName' && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Savvy Name</h3>
                   <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-6">Claim your unique username within the Bitsave ecosystem for peer-to-peer sharing and easier transfers.</p>
                   
                   <div className="relative flex-1 mb-4">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                     <input
                       type="text"
                       value={savvyNameInput}
                       onChange={(e) => setSavvyNameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                       className="w-full pl-10 pr-20 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] dark:text-white shadow-sm transition-all bg-gray-50 dark:bg-[#2a2a2a]"
                       placeholder="your_username"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px] pointer-events-none select-none">.savvy</span>
                   </div>
                   <button
                     onClick={handleSaveSavvyName}
                     disabled={isSavingSavvyName || `${savvyNameInput}.savvy` === currentSavvyName}
                     className="w-full px-6 py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] font-black rounded-xl shadow-md transition-all disabled:opacity-50 disabled:bg-gray-200 dark:disabled:bg-[#333] disabled:text-gray-500"
                   >
                     {isSavingSavvyName ? 'Saving...' : (currentSavvyName && `${savvyNameInput}.savvy` === currentSavvyName ? 'Saved' : 'Update Name')}
                   </button>
                   {currentSavvyName && (
                      <p className="mt-4 text-[13px] text-[#81D7B4] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Tick01Icon className="w-4 h-4" /> Active Savvy Name
                      </p>
                   )}
                </div>
              )}

              {activeModal === 'ens' && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">ENS Identity</h3>
                   <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-6">Link your Ethereum Name Service domain to your profile.</p>
                   <ENSLinking 
                     walletAddress={address}
                     isSolanaNetwork={currentNetwork === 'solana' || (address !== undefined && !address.startsWith('0x') && address.length >= 32)}
                   />
                </div>
              )}

              {activeModal === 'socials' && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Social Connections</h3>
                   <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-6">Link your social accounts to use as your display name or enable extra features.</p>
                   
                   <div className="flex flex-col gap-3">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2a2a2a] gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-bold text-lg shrink-0">𝕏</div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-[#0f172a] dark:text-white text-[14px] truncate">Twitter / X</p>
                              <p className="text-[12px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5 truncate">{isXConnected && xUsername ? `@${xUsername}` : 'Not connected'}</p>
                           </div>
                        </div>
                        {isXConnected && xUsername ? (
                           <button onClick={handleDisconnectX} className="text-[12px] font-bold text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/30 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 px-4 py-2 rounded-lg transition-colors shrink-0">Disconnect</button>
                        ) : (
                           <button onClick={handleConnectX} disabled={isConnectingX} className="text-[12px] font-bold text-[#81D7B4] bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0">
                             {isConnectingX ? 'Connecting...' : 'Connect'}
                           </button>
                        )}
                     </div>

                     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2a2a2a] opacity-60 grayscale cursor-not-allowed gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-[#8a63d2] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">FC</div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-[#0f172a] dark:text-white text-[14px] truncate">Farcaster</p>
                              <p className="text-[12px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5 truncate">Coming soon</p>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
              )}

              {activeModal === 'language' && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Language</h3>
                   <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-6">Select your preferred interface language for the dashboard.</p>
                   <LanguageSelector />
                </div>
              )}

              {activeModal === 'email' && (
                <div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Email Connection</h3>
                   <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-6">Connect your email to receive important account alerts securely.</p>
                   
                   <div className="relative mb-4">
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       disabled={isEmailConnected}
                       placeholder="name@example.com"
                       className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] dark:text-white shadow-sm transition-all bg-gray-50 dark:bg-[#2a2a2a] disabled:bg-gray-100 dark:disabled:bg-[#222] disabled:text-gray-500"
                     />
                   </div>
                   {isEmailConnected ? (
                     <div className="px-6 py-3.5 bg-[#81D7B4]/10 border border-[#81D7B4]/30 text-[#81D7B4] font-black rounded-xl flex items-center justify-center gap-2">
                        <Tick01Icon className="w-5 h-5 stroke-[3]" /> Verified
                     </div>
                   ) : (
                     <button
                        onClick={handleConnectEmail}
                        disabled={!email.trim() || isConnecting}
                        className="w-full px-6 py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] font-black rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                     >
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending OTP...
                          </>
                        ) : 'Connect Email'}
                     </button>
                   )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OTP Modal (Layered on top if email modal opens it) */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 sm:p-10 max-w-[400px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/10"
            >
              <div className="bg-[#81D7B4]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail01Icon className="w-8 h-8 text-[#81D7B4]" />
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
        <div className="fixed inset-0 z-[70] pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
        </div>
      )}

      {/* Savvy Name Success Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 max-w-[400px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/10 relative overflow-hidden"
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
                  Share on X
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

print("Rewrote page.tsx for the grid-based modal architecture successfully.")

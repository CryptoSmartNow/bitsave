with open('app/dashboard/profile/page.tsx', 'r') as f:
    content = f.read()

# Update AVATARS array
old_avatars = """const AVATARS = [
  '/avatars/bitsave-1.png',
  '/avatars/bitsave-2.png',
  '/avatars/bitsave-3.png'
];"""
new_avatars = """const AVATARS = [
  '/avatars/bitsave-1.png',
  '/avatars/bitsave-2.png',
  '/avatars/bitsave-3.png',
  '/avatars/bitsave-4.png',
  '/avatars/bitsave-5.png',
  '/avatars/bitsave-6.png'
];"""
content = content.replace(old_avatars, new_avatars)

# Remove SparklesIcon and change to "My Profile"
old_header = """<h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          Your Profile <SparklesIcon className="w-8 h-8 text-[#81D7B4]" />
        </h1>"""
new_header = """<h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          My Profile
        </h1>"""
content = content.replace(old_header, new_header)

# Change email display to wallet address explicitly, and add some rich stats
old_name_section = """<div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.email?.address?.split('@')[0] || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connected Saver')}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-[#81D7B4] font-mono text-sm bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                {user?.email?.address || activeAddress || 'No wallet connected'}
              </span>
              {activeAddress && (
                <button onClick={copyToClipboard} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all">
                  <Copy01Icon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>"""

new_name_section = """<div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.email?.address?.split('@')[0] || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connected Saver')}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-[#81D7B4] font-mono text-sm bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                {activeAddress ? `${activeAddress.slice(0, 8)}...${activeAddress.slice(-6)}` : 'No wallet connected'}
              </span>
              {activeAddress && (
                <button onClick={copyToClipboard} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all">
                  <Copy01Icon className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Account Level</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Starter</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">2024</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total Vaults</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
               </div>
               <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm text-center md:text-left">
                  <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider mb-1">Total Saved</p>
                  <p className="text-lg font-bold text-[#81D7B4]">$0.00</p>
               </div>
            </div>
          </div>"""

content = content.replace(old_name_section, new_name_section)

# Update the "Recent Activity" spacing slightly to accommodate the new stats
old_recent_activity = 'className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"'
new_recent_activity = 'className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-4"'

content = content.replace(old_recent_activity, new_recent_activity)

with open('app/dashboard/profile/page.tsx', 'w') as f:
    f.write(content)

print("Updated profile page.")

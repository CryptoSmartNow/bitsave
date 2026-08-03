with open('app/dashboard/settings/page.tsx', 'r') as f:
    content = f.read()

# 1. Update copyToClipboard
old_copy = """  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 5000);
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
    }
  };"""

new_copy = """  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1a1a1a] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-4 border-l-4 border-l-[#81D7B4]`}>
            <div className="flex items-center gap-4 w-full">
               <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center shrink-0">
                  <Tick01Icon className="w-5 h-5 text-[#81D7B4]" />
               </div>
               <div className="flex-1">
                 <p className="text-[14px] font-bold text-gray-900 dark:text-white">Address Copied!</p>
                 <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{address.slice(0, 6)}...{address.slice(-4)} is now in your clipboard</p>
               </div>
            </div>
          </div>
        ), { duration: 3000, position: 'bottom-center' });
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
    }
  };"""

content = content.replace(old_copy, new_copy)

# 2. Remove the old toast JSX
old_toast_jsx = """      {/* Copy Notification Toast */}
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
      </AnimatePresence>"""

content = content.replace(old_toast_jsx, "")

# 3. Swap Farcaster for Telegram
old_farcaster = """                     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2a2a2a] opacity-60 grayscale cursor-not-allowed gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-[#8a63d2] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">FC</div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-[#0f172a] dark:text-white text-[14px] truncate">Farcaster</p>
                              <p className="text-[12px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5 truncate">Coming soon</p>
                           </div>
                        </div>
                     </div>"""

new_telegram = """                     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#2a2a2a] opacity-70 cursor-not-allowed gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-[#229ED9]/10 text-[#229ED9] rounded-lg flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                           </div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-[#0f172a] dark:text-white text-[14px] truncate">Telegram Agent</p>
                              <p className="text-[12px] text-[#64748b] dark:text-gray-400 font-medium mt-0.5 truncate">Coming soon</p>
                           </div>
                        </div>
                     </div>"""

content = content.replace(old_farcaster, new_telegram)

with open('app/dashboard/settings/page.tsx', 'w') as f:
    f.write(content)

print("Updated toast and socials.")

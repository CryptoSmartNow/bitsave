with open('app/dashboard/settings/page.tsx', 'r') as f:
    content = f.read()

# Fix the import to include BotIcon and Notification02Icon
old_import = 'import { Tick01Icon, Activity01Icon, Link01Icon, UserMultipleIcon, UserCircleIcon, Settings01Icon, SparklesIcon, PaintBoardIcon, Wallet01Icon, Notification01Icon, GlobalIcon, Mail01Icon, Moon02Icon, ArrowRight01Icon } from "hugeicons-react";'
new_import = 'import { Tick01Icon, Activity01Icon, Link01Icon, UserMultipleIcon, UserCircleIcon, Settings01Icon, SparklesIcon, PaintBoardIcon, Wallet01Icon, Notification01Icon, GlobalIcon, Mail01Icon, Moon02Icon, ArrowRight01Icon, BotIcon, Notification02Icon } from "hugeicons-react";'
content = content.replace(old_import, new_import)

# Fix Savvy Bot Widget Icon
old_bot = '<PaintBoardIcon className="w-[22px] h-[22px] text-[#81D7B4]" />'
new_bot = '<BotIcon className="w-[22px] h-[22px] text-[#81D7B4]" />'
content = content.replace(old_bot, new_bot)

# Fix Push Alerts Icon
old_push = '<Activity01Icon className="w-[22px] h-[22px] text-[#81D7B4]" />'
new_push = '<Notification02Icon className="w-[22px] h-[22px] text-[#81D7B4]" />'
content = content.replace(old_push, new_push)

with open('app/dashboard/settings/page.tsx', 'w') as f:
    f.write(content)

print("Icons fixed.")

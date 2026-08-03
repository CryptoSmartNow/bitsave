import re

with open('app/dashboard/settings/page.tsx', 'r') as f:
    content = f.read()

# Fix icon colors
replacements = [
    # text colors
    (r'text-\[#22c55e\]', r'text-[#81D7B4]'),
    (r'text-blue-500', r'text-[#81D7B4]'),
    (r'text-purple-500', r'text-[#81D7B4]'),
    (r'text-orange-500', r'text-[#81D7B4]'),
    (r'text-rose-500', r'text-[#81D7B4]'),
    (r'text-pink-500', r'text-[#81D7B4]'),
    (r'text-teal-500', r'text-[#81D7B4]'),
    (r'text-cyan-500', r'text-[#81D7B4]'),
    (r'text-indigo-500', r'text-[#81D7B4]'),
    (r'text-violet-500', r'text-[#81D7B4]'),
    # bg/10 colors
    (r'bg-blue-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-purple-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-orange-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-rose-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-pink-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-teal-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-cyan-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-indigo-500/10', r'bg-[#81D7B4]/10'),
    (r'bg-violet-500/10', r'bg-[#81D7B4]/10'),
    # bg colors for toggles
    (r'bg-indigo-500', r'bg-[#81D7B4]'),
    (r'bg-violet-500', r'bg-[#81D7B4]')
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Fix ThemeSelector z-index issue
old_theme_card = 'className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">'
new_theme_card = 'className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-gray-200/60 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-50">'
content = content.replace(old_theme_card, new_theme_card)

with open('app/dashboard/settings/page.tsx', 'w') as f:
    f.write(content)

print("Fixed UI issues.")

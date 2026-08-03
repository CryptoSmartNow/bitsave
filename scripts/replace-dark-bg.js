const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = ['app', 'components'];

const REPLACEMENTS = [
  { pattern: /dark:bg-gray-950/g, replacement: 'dark:bg-[#0a0a0a]' },
  { pattern: /dark:bg-gray-900/g, replacement: 'dark:bg-[#1a1a1a]' },
  { pattern: /dark:bg-gray-800/g, replacement: 'dark:bg-[#121212]' },
  { pattern: /dark:hover:bg-gray-950/g, replacement: 'dark:hover:bg-[#0a0a0a]' },
  { pattern: /dark:hover:bg-gray-900/g, replacement: 'dark:hover:bg-[#1a1a1a]' },
  { pattern: /dark:hover:bg-gray-800/g, replacement: 'dark:hover:bg-[#1a1a1a]' },
  
  // Gradients
  { pattern: /dark:from-gray-900/g, replacement: 'dark:from-[#1a1a1a]' },
  { pattern: /dark:to-gray-800/g, replacement: 'dark:to-[#121212]' },
  
  // Borders
  { pattern: /dark:border-gray-800/g, replacement: 'dark:border-white/10' },
  { pattern: /dark:border-gray-700/g, replacement: 'dark:border-white/10' },

  // For the header layout (since previous run changed it to #121212 incorrectly for components that need elevation)
  { pattern: /dark:bg-\[#121212\] border border-gray-200 dark:border-white\/10/g, replacement: 'dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10' },
  { pattern: /dark:hover:bg-\[#1a1a1a\]/g, replacement: 'dark:hover:bg-white/10' },
  
  // Custom Navy Web3 Colors
  { pattern: /dark:bg-\[#0A0F17\]/g, replacement: 'dark:bg-[#121212]' },
  { pattern: /bg-\[#0A0F17\]/g, replacement: 'bg-[#121212]' }, // Modals that are always dark
  { pattern: /dark:bg-\[#0B1120\]/g, replacement: 'dark:bg-[#121212]' },
  { pattern: /dark:bg-\[#121A27\]/g, replacement: 'dark:bg-[#1a1a1a]' },
  { pattern: /bg-\[#121A27\]/g, replacement: 'bg-[#1a1a1a]' },
  { pattern: /dark:hover:bg-\[#161f2e\]/g, replacement: 'dark:hover:bg-[#1a1a1a]' },
  { pattern: /dark:hover:bg-\[#1C2538\]/g, replacement: 'dark:hover:bg-[#1a1a1a]' },
  { pattern: /hover:bg-\[#1C2538\]/g, replacement: 'hover:bg-[#1a1a1a]' },
  { pattern: /dark:border-\[#1C2538\]/g, replacement: 'dark:border-white/10' },
  { pattern: /border-\[#1C2538\]/g, replacement: 'border-white/10' },
  { pattern: /dark:border-\[#2C3E5D\]/g, replacement: 'dark:border-white/20' },
  { pattern: /border-\[#2C3E5D\]/g, replacement: 'border-white/20' },
  { pattern: /dark:text-\[#7B8B9A\]/g, replacement: 'dark:text-gray-400' },
  { pattern: /text-\[#7B8B9A\]/g, replacement: 'text-gray-400' },
  { pattern: /dark:placeholder:text-\[#2C3E5D\]/g, replacement: 'dark:placeholder:text-gray-500' },
  { pattern: /placeholder:text-\[#2C3E5D\]/g, replacement: 'placeholder:text-gray-500' },
  
  // Custom dark blue from first dashboard issue
  { pattern: /bg-\[#0B1426\]/g, replacement: 'bg-[#121212]' },
  { pattern: /bg-\[#131B2C\]/g, replacement: 'bg-[#1a1a1a]' },
  { pattern: /dark:bg-\[#0F172A\]/g, replacement: 'dark:bg-[#1a1a1a]' },
  { pattern: /bg-\[#0F1825\]/g, replacement: 'bg-[#121212]' },
  { pattern: /bg-\[#0b0c15\]/g, replacement: 'bg-[#121212]' },
  { pattern: /bg-\[#0A0D10\]/g, replacement: 'bg-[#121212]' },
  { pattern: /bg-\[#0B1014\]/g, replacement: 'bg-[#1a1a1a]' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const { pattern, replacement } of REPLACEMENTS) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

DIRECTORIES_TO_SCAN.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  } else {
    console.warn(`Directory not found: ${fullPath}`);
  }
});

console.log('Complete!');

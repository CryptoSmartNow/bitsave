const fs = require('fs');
const path = './app/dashboard/ramp/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace #0f172a with #0F1825
content = content.replace(/#0f172a/g, '#0F1825');

// Replace hover:bg-black with hover:bg-[#1A2538]
content = content.replace(/hover:bg-black/g, 'hover:bg-[#1A2538]');

// Replace bg-black with bg-[#0F1825] just in case
content = content.replace(/bg-black/g, 'bg-[#0F1825]');

fs.writeFileSync(path, content);
console.log('Colors replaced successfully!');

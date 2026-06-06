import fs from 'fs';
import path from 'path';

function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, ext, fileList);
    } else if (ext.includes(path.extname(fullPath))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = [
  ...findFiles('./app', ['.tsx', '.ts']),
  ...findFiles('./components', ['.tsx', '.ts'])
];

const regex = /(?<!<|\/|\w)([A-Z][a-zA-Z0-9]*?)(01|02|03|04)?Icon(?!\w|\s*(>|\/|=|from))/g;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(regex, (match, p1, p2, p3, offset, str) => {
        // Exclude if it's inside an import statement
        const before = str.substring(Math.max(0, offset - 100), offset);
        if (before.includes('import ') && !before.includes('\n')) return match;
        // Exclude if it's inside an icon prop: icon={Wallet01Icon}
        if (before.match(/icon\s*=\s*\{$/)) return match;
        if (before.match(/icon:\s*$/)) return match;
        if (before.match(/icon\s*=\s*$/)) return match;

        // If it's pure text, just return the base word (e.g. Wallet)
        return p1;
    });

    // Special fix for 'Save01Icon Changes'
    content = content.replace(/Save01Icon Changes/g, 'Save Changes');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Cleaned text nodes in ${file}`);
    }
}

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

const icons = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match import { ... } from 'react-icons/...' or 'lucide-react'
  const regex = /import\s+\{([^}]+)\}\s+from\s+['"](?:react-icons\/[a-z]+|lucide-react)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const imp of imports) {
      // Handle aliases like "FiMenu as FiMenuIcon"
      icons.add(imp);
    }
  }
}

console.log([...icons].sort().join('\n'));

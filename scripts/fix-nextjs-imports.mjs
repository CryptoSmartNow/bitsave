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

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // 1. Move 'use client' to the very top if it exists
    const useClientRegex = /^\s*['"]use client['"];?\s*/m;
    if (useClientRegex.test(content)) {
        // Remove it from its current position
        content = content.replace(useClientRegex, '');
        // Add it to the top
        content = "'use client';\n\n" + content.trimStart();
    }

    // 2. Fix next/image (AiImageIcon -> Image)
    if (content.includes("from 'next/image'") || content.includes('from "next/image"')) {
        content = content.replace(/import\s+AiImageIcon\s+from\s+['"]next\/image['"]/g, "import Image from 'next/image'");
        content = content.replace(/<AiImageIcon/g, "<Image");
        content = content.replace(/<\/AiImageIcon>/g, "</Image>");
    }

    // 3. Fix next/link (Link01Icon -> Link)
    if (content.includes("from 'next/link'") || content.includes('from "next/link"')) {
        content = content.replace(/import\s+Link01Icon\s+from\s+['"]next\/link['"]/g, "import Link from 'next/link'");
        content = content.replace(/<Link01Icon/g, "<Link");
        content = content.replace(/<\/Link01Icon>/g, "</Link>");
    }

    // 4. Fix next/font/google (Exo) if any icons mapped there... probably not.

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}

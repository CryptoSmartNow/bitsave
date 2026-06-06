import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get all modified files
const status = execSync('git status --porcelain').toString();
const files = status.split('\n')
  .filter(line => line.startsWith(' M') || line.startsWith('M '))
  .map(line => line.substring(3).trim())
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

for (const file of files) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Find hugeicons-react import
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]hugeicons-react['"]/g;
  content = content.replace(importRegex, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newImports = imports.map(imp => {
      // If it already ends with Icon, leave it
      if (imp.endsWith('Icon')) return imp;
      
      // Look for the correct name in the file
      // Could be imp + 'Icon', imp + '01Icon', imp + '02Icon'
      const possibleNames = [imp + 'Icon', imp + '01Icon', imp + '02Icon', imp + '03Icon', imp + '04Icon'];
      for (const name of possibleNames) {
        if (content.includes(name)) {
          return name;
        }
      }
      return imp; // Leave as is if not found
    });
    
    // Check if anything changed
    if (imports.join(', ') !== newImports.join(', ')) {
      changed = true;
      return `import { ${newImports.join(', ')} } from "hugeicons-react"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Repaired imports in ${file}`);
  }
}

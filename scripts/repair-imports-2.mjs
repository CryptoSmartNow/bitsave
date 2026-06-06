import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const validIconsFile = path.resolve(process.cwd(), 'scripts/migrate-icons/hugeicons.txt');
const validIcons = new Set(fs.readFileSync(validIconsFile, 'utf8').split('\n').map(s => s.trim()).filter(Boolean));

const status = execSync('git status --porcelain').toString();
const files = status.split('\n')
  .filter(line => line.startsWith(' M') || line.startsWith('M ') || line.startsWith('??'))
  .map(line => line.substring(3).trim())
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

for (const file of files) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]hugeicons-react['"]/g;
  content = content.replace(importRegex, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newImports = imports.map(imp => {
      // Handle the Duplicate 'Link' issue in dashboard/savvy-bot/page.tsx
      if (imp === 'Link' || imp === 'LinkIcon' || imp === 'Link01Icon') {
          // If it conflicts, we should alias it or leave it if it's already Aliased
          if (imp.includes(' as ')) return imp;
          // In savvy-bot/page.tsx we had an error: Duplicate identifier 'Link'.
          // To be safe, we will just alias Link:
          if (validIcons.has('Link01Icon')) return 'Link01Icon';
          if (validIcons.has('LinkIcon')) return 'LinkIcon';
      }

      if (validIcons.has(imp)) return imp;
      
      const possibleNames = [imp + 'Icon', imp + '01Icon', imp + '02Icon'];
      for (const name of possibleNames) {
        if (validIcons.has(name)) {
          return name;
        }
      }
      return imp; 
    });
    
    // De-duplicate imports
    const uniqueImports = [...new Set(newImports)];
    
    if (imports.join(', ') !== uniqueImports.join(', ')) {
      changed = true;
      return `import { ${uniqueImports.join(', ')} } from "hugeicons-react"`;
    }
    return match;
  });

  // Specifically fix Duplicate identifier 'BarChart' and 'PieChart' in user-interactions/analytics/page.tsx
  if (file.includes('user-interactions/analytics/page.tsx')) {
    // Check if there are duplicate imports of BarChart
    content = content.replace(/import\s*{\s*BarChart,\s*BarChartIcon/, 'import { BarChartIcon');
    content = content.replace(/import\s*{\s*PieChart,\s*PieChartIcon/, 'import { PieChartIcon');
    content = content.replace(/import\s*{\s*BarChart\s*}\s*from\s*['"]recharts['"]/, 'import { BarChart as RechartsBarChart } from "recharts"');
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Repaired imports in ${file}`);
  }
}

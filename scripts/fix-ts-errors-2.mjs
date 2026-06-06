import fs from 'fs';

function fixFile(file, replacer) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Fixed ${file}`);
    }
}

// Fix Recharts PieChart
const rechartsFiles = [
    'app/bizfi/admin/analytics/page.tsx',
    'app/bizfi/admin/page.tsx',
    'app/user-interactions/analytics/page.tsx'
];
for (const file of rechartsFiles) {
    fixFile(file, c => c
        .replace(/import\s*\{\s*([^}]*?)PieChartIcon([^}]*?)\}\s*from\s*['"]recharts['"]/g, "import { $1PieChart$2 } from 'recharts'")
        .replace(/<PieChartIcon/g, "<PieChart")
        .replace(/<\/PieChartIcon>/g, "</PieChart>")
        // Fix the case where PieChartIcon was added to hugeicons-react instead
        .replace(/import\s*\{\s*PieChartIcon,\s*PieChartIcon\s*\}\s*from\s*['"]hugeicons-react['"]/g, "import { PieChartIcon } from 'hugeicons-react'")
        // Make sure PieChart is imported from recharts if it got lost entirely
        .replace(/import\s*\{\s*([^}]*?)\s*\}\s*from\s*['"]recharts['"]/, (match, group) => {
            if (!group.includes('PieChart')) {
                return `import { ${group}, PieChart } from 'recharts'`;
            }
            return match;
        })
    );
}

// Fix Coinbase Onchainkit Wallet
fixFile('components/NetworkConnectionUI.tsx', c => c
    .replace(/import\s*\{\s*([^}]*?)Wallet01Icon([^}]*?)\}\s*from\s*['"]@coinbase\/onchainkit\/wallet['"]/g, "import { $1Wallet$2 } from '@coinbase/onchainkit/wallet'")
    .replace(/<Wallet01Icon/g, "<Wallet")
    .replace(/<\/Wallet01Icon>/g, "</Wallet>")
);

// Fix title prop in app/bizswap/app/page.tsx
fixFile('app/bizswap/app/page.tsx', c => c.replace(/title=['"][^'"]*['"]/g, ''));

// Duplicate Link01Icon
fixFile('app/dashboard/savvy-bot/page.tsx', c => c.replace(/Link01Icon,\s*Link01Icon/g, 'Link01Icon'));
fixFile('app/user-interactions/analytics/page.tsx', c => c.replace(/PieChartIcon,\s*PieChartIcon/g, 'PieChartIcon'));

// Mappings
const manualMap = {
    LightBulbIcon: 'BulbIcon',
    VideoCameraIcon: 'Video01Icon',
    ScaleIcon: 'BalanceScaleIcon'
};

const otherFiles = [
    'app/bizfi/dashboard/launchpad/BusinessDetailsModal.tsx',
    'app/bizfi/dashboard/layout.tsx',
    'app/bizfun/page.tsx'
];

for (const file of otherFiles) {
    fixFile(file, c => {
        let text = c;
        for (const [oldIcon, newIcon] of Object.entries(manualMap)) {
            text = text.replace(new RegExp(oldIcon, 'g'), newIcon);
        }
        return text;
    });
}

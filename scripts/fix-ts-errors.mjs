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

fixFile('app/api/bizfi/attest/route.ts', c => c.replace(/Wallet01Icon/g, 'Wallet'));
fixFile('app/bizfi/admin/analytics/page.tsx', c => c.replace(/import\s*\{\s*PieChartIcon\s*\}\s*from\s*['"]recharts['"]/g, "import { PieChart } from 'recharts'").replace(/<PieChartIcon/g, "<PieChart").replace(/<\/PieChartIcon>/g, "</PieChart>"));
fixFile('app/bizfi/admin/page.tsx', c => c.replace(/import\s*\{\s*PieChartIcon\s*\}\s*from\s*['"]recharts['"]/g, "import { PieChart } from 'recharts'").replace(/<PieChartIcon/g, "<PieChart").replace(/<\/PieChartIcon>/g, "</PieChart>"));
fixFile('app/user-interactions/analytics/page.tsx', c => c.replace(/import\s*\{\s*PieChartIcon\s*\}\s*from\s*['"]recharts['"]/g, "import { PieChart } from 'recharts'").replace(/<PieChartIcon/g, "<PieChart").replace(/<\/PieChartIcon>/g, "</PieChart>"));

fixFile('components/NetworkConnectionUI.tsx', c => c.replace(/import\s*\{\s*Wallet01Icon\s*\}\s*from\s*['"]@coinbase\/onchainkit\/wallet['"]/g, "import { Wallet } from '@coinbase/onchainkit/wallet'").replace(/<Wallet01Icon/g, "<Wallet").replace(/<\/Wallet01Icon>/g, "</Wallet>"));

// Title props on Hugeicons
fixFile('app/bizswap/app/page.tsx', c => c.replace(/<([A-Za-z0-9_]+Icon)\s+title=[^>]+>/g, "<$1>"));

// Duplicate Link01Icon
fixFile('app/dashboard/savvy-bot/page.tsx', c => c.replace(/import\s*\{\s*Link01Icon,\s*Link01Icon\s*\}\s*from\s*['"]hugeicons-react['"]/g, "import { Link01Icon } from 'hugeicons-react'"));

// Duplicate PieChartIcon
fixFile('app/user-interactions/analytics/page.tsx', c => c.replace(/import\s*\{\s*PieChartIcon,\s*PieChartIcon\s*\}\s*from\s*['"]hugeicons-react['"]/g, "import { PieChartIcon } from 'hugeicons-react'"));

// Save01Icon -> CheckListIcon or FloppyDiskIcon
fixFile('app/bizfi/admin/components/LoanAgreementEditor.tsx', c => c.replace(/Save01Icon/g, 'CheckListIcon'));

// Helper to inject imports
function injectImport(c, icons) {
    if (!icons || icons.length === 0) return c;
    const iconsStr = icons.join(', ');
    if (c.includes('import {') && c.includes('hugeicons-react')) {
        return c.replace(/import\s*\{([^}]+)\}\s*from\s*['"]hugeicons-react['"]/, `import { $1, ${iconsStr} } from 'hugeicons-react'`);
    } else {
        return `import { ${iconsStr} } from 'hugeicons-react';\n` + c;
    }
}

// Map the missing HiOutline components left in JSX
const mapHiOutline = {
    HiOutlineBuildingStorefront: 'Building04Icon',
    HiOutlineBuildingOffice2: 'Building04Icon',
    HiOutlineBriefcase: 'Briefcase01Icon',
    HiOutlineLightBulb: 'LightBulbIcon',
    HiOutlineGlobeAlt: 'GlobeIcon',
    HiOutlineFlag: 'Flag01Icon',
    HiOutlineDocumentText: 'TextIcon',
    HiOutlineClock: 'Clock01Icon',
    HiOutlineXCircle: 'Cancel01Icon',
    HiOutlineRocketLaunch: 'RocketIcon',
    HiOutlineFolder: 'Folder01Icon',
    HiOutlineVideoCamera: 'VideoCameraIcon',
    HiOutlineChatBubbleBottomCenterText: 'Message02Icon',
    HiOutlineQuestionMarkCircle: 'InformationCircleIcon',
    HiOutlineChartBarSquare: 'BarChartIcon',
    HiOutlineGift: 'GiftIcon',
    HiOutlineCubeTransparent: 'CubeIcon',
    HiOutlinePresentationChartLine: 'PresentationBarChart01Icon',
    HiOutlineScale: 'ScaleIcon',
    HiOutlineCalculator: 'CalculatorIcon',
};

const mapGeneric = {
    HeadingIcon: 'HeadingIcon',
    InboxIcon: 'InboxIcon',
    Wallet01Icon: 'Wallet01Icon',
    ArrowLeftRightIcon: 'ArrowLeftRightIcon',
    Sun01Icon: 'Sun01Icon',
    Moon01Icon: 'Moon01Icon',
    ComputerSettingsIcon: 'ComputerSettingsIcon',
};

const allFiles = [
    'app/bizfi/admin/businesses/[id]/page.tsx',
    'app/bizfi/dashboard/launchpad/BusinessDetailsModal.tsx',
    'app/bizfi/dashboard/launchpad/components/ProjectTimeline.tsx',
    'app/bizfi/dashboard/launchpad/page.tsx',
    'app/bizfi/dashboard/layout.tsx',
    'app/bizfi/page.tsx',
    'app/bizfun/page.tsx',
    'app/bizswap/dashboard/layout.tsx',
    'app/bizswap/page.tsx',
    'app/components/EmptyState.tsx',
    'components/RichTextEditor.tsx',
    'components/ThemeSelector.tsx'
];

for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let added = new Set();
    
    for (const [oldName, newName] of Object.entries({...mapHiOutline})) {
        if (content.includes(oldName)) {
            content = content.replace(new RegExp(oldName, 'g'), newName);
            added.add(newName);
        }
    }

    for (const [oldName, newName] of Object.entries({...mapGeneric})) {
         // if it's used but not imported
         if (content.includes(newName) && !content.includes(`import {`) && !content.includes(`from 'hugeicons-react'`)) {
             // Let's just blindly add it if it's used
             added.add(newName);
         } else if (content.includes(newName)) {
             // check if it's in the hugeicons import
             const hugeRegex = /import\s*\{([^}]+)\}\s*from\s*['"]hugeicons-react['"]/;
             const match = content.match(hugeRegex);
             if (match && !match[1].includes(newName)) {
                 added.add(newName);
             } else if (!match) {
                 added.add(newName);
             }
         }
    }

    if (added.size > 0) {
        content = injectImport(content, Array.from(added));
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
}

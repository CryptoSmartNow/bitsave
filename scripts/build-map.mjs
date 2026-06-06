import fs from 'fs';

const hugeicons = fs.readFileSync('./scripts/migrate-icons/hugeicons.txt', 'utf8').split('\n');

const usedIcons = [
'Activity', 'AlertCircle', 'AlertTriangle', 'ArrowDownCircle', 'ArrowLeft', 'ArrowRight', 'ArrowRightLeft', 'ArrowUpCircle', 'ArrowUpRight', 'Award', 'BadgeCheck', 'BarChart3', 'Bell', 'Bold', 'Bot', 'Building2', 'Calculator', 'Calendar', 'Check', 'CheckCircle', 'CheckCircle2', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Clock', 'Code', 'Coins', 'Copy', 'Cpu', 'Crown', 'Database', 'DollarSign', 'Download', 'Edit2', 'Edit3', 'ExternalLink', 'Eye', 'FaTelegramPlane', 'FaWhatsapp', 'FaYoutube', 'FiArrowRight', 'FiArrowUpRight', 'FiChevronUp', 'FiFileText', 'FiMail', 'FiMenu', 'FiMinus', 'FiPlus', 'FiX', 'FileText', 'Filter', 'GiCrabClaw', 'Gift', 'Github', 'Globe', 'Hammer', 'Heading1', 'Heading2', 'Heading3', 'Hexagon', 'HiCheck', 'HiOutlineColorSwatch', 'HiOutlinePencil', 'HiOutlineTrash', 'HiX', 'Image', 'Import', 'Italic', 'Layout', 'LayoutDashboard', 'Link', 'Linkedin', 'List', 'ListOrdered', 'Loader2', 'Lock', 'LogOut', 'Medal', 'Menu', 'MessageCircle', 'MessageSquare', 'MoreVertical', 'MousePointerClick', 'PieChart', 'Play', 'Plus', 'Printer', 'Quote', 'RefreshCw', 'Rocket', 'RotateCw', 'Save', 'Search', 'Send', 'Server', 'Settings', 'Share2', 'Shield', 'ShieldCheck', 'Sparkles', 'Sprout', 'Target', 'Ticket', 'Trash2', 'TrendingDown', 'TrendingUp', 'Trophy', 'Twitter', 'Underline', 'User', 'Users', 'Wallet', 'WalletCards', 'WifiOff', 'X', 'XCircle', 'Zap'
];

function simplify(str) {
  return str.toLowerCase().replace(/^(fi|fa|hi|gi|outline)/, '').replace(/icon$/, '');
}

const hugeMap = {};
for (const icon of hugeicons) {
  hugeMap[simplify(icon)] = icon;
}

const exactMap = {};
for (const icon of usedIcons) {
  const simple = simplify(icon);
  if (hugeMap[simple]) {
    exactMap[icon] = hugeMap[simple];
  } else {
    // try to find partial
    const partial = hugeicons.find(h => simplify(h).includes(simple) || simple.includes(simplify(h)));
    if (partial) {
       exactMap[icon] = partial;
    } else {
       exactMap[icon] = 'HugeiconsIcon'; // Fallback
    }
  }
}

fs.writeFileSync('scripts/icon-map.json', JSON.stringify(exactMap, null, 2));
console.log('Map generated');

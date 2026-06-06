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

const manualMap = {
  Activity: 'Activity01Icon',
  AlertCircle: 'Alert01Icon',
  AlertTriangle: 'Alert02Icon',
  ArrowDownCircle: 'ArrowDown01Icon',
  ArrowLeft: 'ArrowLeft01Icon',
  ArrowRight: 'ArrowRight01Icon',
  ArrowRightLeft: 'ArrowLeftRightIcon',
  ArrowUpCircle: 'ArrowUp01Icon',
  ArrowUpRight: 'ArrowUpRight01Icon',
  Award: 'Award01Icon',
  BadgeCheck: 'CheckmarkBadge01Icon',
  BarChart3: 'BarChartIcon',
  Bell: 'Notification01Icon',
  Bold: 'TextBoldIcon',
  Bot: 'BotIcon',
  Building2: 'Building04Icon',
  Calculator: 'CalculatorIcon',
  Calendar: 'Calendar01Icon',
  Check: 'Tick01Icon',
  CheckCircle: 'Tick01Icon',
  CheckCircle2: 'TickDouble01Icon',
  ChevronDown: 'ArrowDown01Icon',
  ChevronLeft: 'ArrowLeft01Icon',
  ChevronRight: 'ArrowRight01Icon',
  ChevronUp: 'ArrowUp01Icon',
  Clock: 'Clock01Icon',
  Code: 'CodeIcon',
  Coins: 'Coins01Icon',
  Copy: 'Copy01Icon',
  Cpu: 'CpuIcon',
  Crown: 'CrownIcon',
  Database: 'DatabaseIcon',
  DollarSign: 'Dollar01Icon',
  Download: 'Download01Icon',
  Edit2: 'Edit02Icon',
  Edit3: 'Edit02Icon',
  ExternalLink: 'LinkSquare01Icon',
  Eye: 'ViewIcon',
  FaTelegramPlane: 'TelegramIcon',
  FaWhatsapp: 'WhatsappIcon',
  FaYoutube: 'YoutubeIcon',
  FiArrowRight: 'ArrowRight01Icon',
  FiArrowUpRight: 'ArrowUpRight01Icon',
  FiChevronUp: 'ArrowUp01Icon',
  FiFileText: 'TextIcon',
  FiMail: 'Mail01Icon',
  FiMenu: 'Menu01Icon',
  FiMinus: 'MinusSignIcon',
  FiPlus: 'PlusSignIcon',
  FiX: 'Cancel01Icon',
  FileText: 'TextIcon',
  Filter: 'FilterIcon',
  GiCrabClaw: 'CrabIcon',
  Gift: 'GiftIcon',
  Github: 'GithubIcon',
  Globe: 'GlobeIcon',
  Hammer: 'LegalHammerIcon',
  Heading1: 'HeadingIcon',
  Heading2: 'HeadingIcon',
  Heading3: 'HeadingIcon',
  Hexagon: 'HexagonIcon',
  HiBol: 'FlashIcon',
  HiCheck: 'Tick01Icon',
  HiCheckCircle: 'Tick01Icon',
  HiChevronDown: 'ArrowDown01Icon',
  HiOutlineArrowDown: 'ArrowDown01Icon',
  HiOutlineArrowDownTray: 'Download01Icon',
  HiOutlineArrowLef: 'ArrowLeft01Icon',
  HiOutlineArrowPath: 'RefreshIcon',
  HiOutlineArrowRigh: 'ArrowRight01Icon',
  HiOutlineArrowRightOnRectangle: 'Logout01Icon',
  HiOutlineArrowTopRightOnSquare: 'LinkSquare01Icon',
  HiOutlineAtSymbol: 'AtIcon',
  HiOutlineBanknotes: 'Money01Icon',
  HiOutlineBell: 'Notification01Icon',
  HiOutlineCalendar: 'Calendar01Icon',
  HiOutlineChartBar: 'BarChartIcon',
  HiOutlineChartPie: 'PieChartIcon',
  HiOutlineChatBubbleLeftRigh: 'Message02Icon',
  HiOutlineCheck: 'Tick01Icon',
  HiOutlineCheckCircle: 'Tick01Icon',
  HiOutlineChevronDown: 'ArrowDown01Icon',
  HiOutlineChevronLef: 'ArrowLeft01Icon',
  HiOutlineChevronRigh: 'ArrowRight01Icon',
  HiOutlineClipboardDocumentLis: 'Task01Icon',
  HiOutlineCog: 'Settings01Icon',
  HiOutlineColorSwatch: 'PaintBoardIcon',
  HiOutlineCurrencyDollar: 'Dollar01Icon',
  HiOutlineDocumentTex: 'TextIcon',
  HiOutlineExclamationTriangle: 'Alert02Icon',
  HiOutlineEye: 'ViewIcon',
  HiOutlineGif: 'GifIcon',
  HiOutlineGlobeAl: 'GlobeIcon',
  HiOutlineHashtag: 'HashtagIcon',
  HiOutlineHear: 'FavouriteIcon',
  HiOutlineHome: 'Home01Icon',
  HiOutlineInbox: 'InboxIcon',
  HiOutlineInformationCircle: 'InformationCircleIcon',
  HiOutlineLink: 'Link01Icon',
  HiOutlineMagnifyingGlass: 'Search01Icon',
  HiOutlinePaperAirplane: 'SentIcon',
  HiOutlinePencil: 'Edit02Icon',
  HiOutlinePlus: 'PlusSignIcon',
  HiOutlineShieldCheck: 'Shield01Icon',
  HiOutlineSparkles: 'SparklesIcon',
  HiOutlineTrash: 'Delete02Icon',
  HiOutlineTrophy: 'Award01Icon',
  HiOutlineUserGroup: 'UserMultipleIcon',
  HiOutlineUserPlus: 'UserAdd01Icon',
  HiOutlineUsers: 'UserMultipleIcon',
  HiOutlineWalle: 'Wallet01Icon',
  HiOutlineWallet: 'Wallet01Icon',
  HiOutlineArrowsRightLeft: 'ArrowLeftRightIcon',
  HiOutlineSun: 'Sun01Icon',
  HiOutlineMoon: 'Moon01Icon',
  HiOutlineComputerDesktop: 'ComputerSettingsIcon',
  HiOutlineXMark: 'Cancel01Icon',
  HiX: 'Cancel01Icon',
  HiXMark: 'Cancel01Icon',
  Image: 'AiImageIcon',
  Import: 'DatabaseIcon',
  Italic: 'TextItalicIcon',
  Layout: 'Layout01Icon',
  LayoutDashboard: 'DashboardSquare01Icon',
  Link: 'Link01Icon',
  Linkedin: 'Linkedin01Icon',
  List: 'ListViewIcon',
  ListOrdered: 'ListViewIcon',
  Loader2: 'Loading02Icon',
  Lock: 'LockIcon',
  LogOut: 'Logout01Icon',
  Medal: 'Medal01Icon',
  Menu: 'Menu01Icon',
  MessageCircle: 'Message01Icon',
  MessageSquare: 'Message02Icon',
  MoreVertical: 'MoreVerticalIcon',
  MousePointerClick: 'CursorPointer01Icon',
  PieChart: 'PieChartIcon',
  Play: 'PlayIcon',
  Plus: 'PlusSignIcon',
  Printer: 'PrinterIcon',
  Quote: 'QuoteDownIcon',
  RefreshCw: 'RefreshIcon',
  Rocket: 'RocketIcon',
  RotateCw: 'RotateRight01Icon',
  Save: 'Save01Icon',
  Search: 'Search01Icon',
  Send: 'SentIcon',
  Server: 'CloudServerIcon',
  Settings: 'Settings01Icon',
  Share2: 'Share01Icon',
  Shield: 'Shield01Icon',
  ShieldCheck: 'Shield01Icon',
  Sparkles: 'SparklesIcon',
  Sprout: 'Plant01Icon',
  Target: 'Target01Icon',
  Ticket: 'Ticket01Icon',
  Trash2: 'Delete02Icon',
  TrendingDown: 'ArrowDown01Icon',
  TrendingUp: 'ArrowUpRight01Icon',
  Trophy: 'Award01Icon',
  Twitter: 'TwitterIcon',
  FaXTwitter: 'TwitterIcon',
  Underline: 'TextUnderlineIcon',
  User: 'UserIcon',
  Users: 'UserMultipleIcon',
  Wallet: 'Wallet01Icon',
  WalletCards: 'Wallet02Icon',
  WifiOff: 'WifiDisconnected01Icon',
  X: 'Cancel01Icon',
  XCircle: 'Cancel01Icon',
  Zap: 'FlashIcon',
};

// Aliases
manualMap['FiMenuIcon'] = 'Menu01Icon';
manualMap['FiXIcon'] = 'Cancel01Icon';
manualMap['PieIcon'] = 'PieChartIcon';
manualMap['CheckCircleIcon'] = 'Tick01Icon';
manualMap['Badge01Icon'] = 'CheckmarkBadge01Icon';
manualMap['BarChart02Icon'] = 'BarChartIcon';
manualMap['DocumentTextIcon'] = 'TextIcon';
manualMap['TrendingUp01Icon'] = 'ArrowUpRight01Icon';
manualMap['TrendingDown01Icon'] = 'ArrowDown01Icon';
manualMap['Trophy01Icon'] = 'Award01Icon';
manualMap['ServerIcon'] = 'CloudServerIcon';
manualMap['Hammer01Icon'] = 'LegalHammerIcon';
manualMap['List01Icon'] = 'ListViewIcon';
manualMap['ImageIcon'] = 'AiImageIcon';
manualMap['ShieldTickIcon'] = 'Shield01Icon';
manualMap['InformationIcon'] = 'InformationCircleIcon';
manualMap['CursorPointerIcon'] = 'CursorPointer01Icon';

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Also replace any old missing ones from previous run
  for (const [bad, good] of Object.entries(manualMap)) {
    if (content.includes(bad)) {
        const regex = new RegExp("(^|[^a-zA-Z0-9_])" + bad + "([^a-zA-Z0-9_]|$)", 'g');
        content = content.replace(regex, "$1" + good + "$2");
    }
  }

  // Find remaining react-icons and lucide-react imports just in case
  const regex = /import\s+\{([^}]+)\}\s+from\s+['"](?:react-icons\/[a-z0-9]+|lucide-react)['"]/g;
  let match;
  let hugeIconsToImport = new Set();
  
  while ((match = regex.exec(content)) !== null) {
    const importBlock = match[1];
    const imports = importBlock.split(',').map(s => s.trim()).filter(Boolean);
    
    for (const imp of imports) {
      let originalName = imp;
      let localName = imp;
      
      if (imp.includes(' as ')) {
        const parts = imp.split(' as ');
        originalName = parts[0].trim();
        localName = parts[1].trim();
      }
      
      const newIcon = manualMap[originalName] || manualMap[localName] || 'Activity01Icon';
      hugeIconsToImport.add(newIcon);
      
      // Replace all word occurrences of the localName
      const wordRegex = new RegExp("(^|[^a-zA-Z0-9_])" + localName + "([^a-zA-Z0-9_]|$)", 'g');
      content = content.replace(wordRegex, "$1" + newIcon + "$2");
    }
  }

  // Remove old imports
  content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"](?:react-icons\/[a-z0-9]+|lucide-react)['"];?\n?/g, '');
  
  // Aggregate existing hugeicons-react imports to merge them
  const hugeRegex = /import\s+\{([^}]+)\}\s+from\s+['"]hugeicons-react['"];?\n?/g;
  let hugeMatch;
  while ((hugeMatch = hugeRegex.exec(content)) !== null) {
      const imps = hugeMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      for(const i of imps) hugeIconsToImport.add(i);
  }
  content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]hugeicons-react['"];?\n?/g, '');

  if (hugeIconsToImport.size > 0) {
    const importStatement = `import { ${[...hugeIconsToImport].join(', ')} } from "hugeicons-react";\n`;
    
    // Find right place to inject
    if (content.includes('import React')) {
       content = content.replace(/import React[^\n]+\n/, "$&" + importStatement);
    } else {
       content = importStatement + content;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

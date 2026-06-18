const fs = require('fs');
let code = fs.readFileSync('app/bizswap/wc26/page.tsx', 'utf8');

// 1. Replace imports
code = code.replace("import { PaymentModal } from '@chainrails/react';", "import { UnifiedFiatModal } from '@/components/UnifiedFiatModal';");
code = code.replace("import { ONSWITCH_COUNTRIES, CountryData } from './countries';", "");
code = code.replace("import { Search01Icon } from 'hugeicons-react';", "");

// 2. Remove states related to the raw modals
const statesToRemove = [
  "const [showChainrailsModal, setShowChainrailsModal] = useState(false);",
  "const [showMethodModal, setShowMethodModal] = useState(false);",
  "const [showCountryModal, setShowCountryModal] = useState(false);",
  "const [showKycModal, setShowKycModal] = useState(false);",
  "const [kycName, setKycName] = useState('');",
  "const [kycEmail, setKycEmail] = useState('');",
  "const [kycPhone, setKycPhone] = useState('');",
  "const [searchQuery, setSearchQuery] = useState('');",
  "const [selectedCountry, setSelectedCountry] = useState<CountryData>(ONSWITCH_COUNTRIES.find(c => c.code === 'NG')!);",
  "const [showBankModal, setShowBankModal] = useState(false);",
  "const [bankDetails, setBankDetails] = useState<any>(null);",
  "const [onswitchReference, setOnswitchReference] = useState<string | null>(null);"
];
for (const state of statesToRemove) {
  code = code.replace(state + '\n', '');
}

// 3. Add unified modal state
code = code.replace(
  "const [showConfirmModal, setShowConfirmModal] = useState(false);",
  "const [showConfirmModal, setShowConfirmModal] = useState(false);\n  const [showUnifiedModal, setShowUnifiedModal] = useState(false);"
);

// 4. Update initiateBuy
code = code.replace(
  "setShowMethodModal(true);",
  "setShowUnifiedModal(true);"
);

// 5. Update handleDepositSuccess
code = code.replace(
  /const handleDepositSuccess = async \(\) => {[\s\S]*?};/,
  `const handleDepositSuccess = async () => {
    const tx = pendingTxRef.current || pendingTx;
    if (tx && tx.type === 'buy') {
      await executeBuy(tx);
      setShowUnifiedModal(false);
    } else {
      toast.success("Payment successful!");
      fetchData();
      setShowUnifiedModal(false);
    }
  };`
);

// 6. Update handleInitiateDeposit -> it shouldn't show Chainrails directly anymore if we use the unified modal,
// but wait! handleInitiateDeposit just sets sessionToken and depositAmount. We don't even need to show the Chainrails modal.
// The Unified modal handles it. Wait, the unified modal calls `handleInitiateDeposit`? No, the unified modal expects `sessionToken` to exist or the parent generates it.
// Let's modify initiateBuy to generate the session token FIRST.
code = code.replace(
  /const initiateBuy = \(\) => {[\s\S]*?setShowUnifiedModal\(true\);\n  };/,
  `const initiateBuy = async () => {
    if (!connected) return toast.error("Please connect your account first");
    const shares = parseInt(buyAmount);
    if (!shares || shares <= 0) return toast.error("Enter a valid number of shares");
    if (!poolState?.trading_open) return toast.error("Trading is currently closed");

    const currentPrice = poolState?.current_price_usd;
    const cost = shares * currentPrice * 1.01;

    setPendingTx({ type: 'buy', shares });
    
    // Generate chainrails session preemptively
    try {
      const amount = (Math.ceil(cost * 100) / 100).toFixed(2);
      const params = new URLSearchParams({
        recipient: '0xe1896D5E7547D63e79861d53A3DaCb066769Dfb1',
        amount: amount,
        chain: 'BASE',
        token: 'USDC',
        mode: 'buy',
        source: 'bizswap'
      });
      const res = await fetch(\`/api/chainrails/session?\${params}\`);
      const data = await res.json();
      if (res.ok) {
        setSessionToken(data.sessionToken || data.token || data.session_token);
      }
    } catch (e) {
      console.warn("Chainrails preemptive init failed", e);
    }

    setShowUnifiedModal(true);
  };`
);

// 7. Remove handleFiatPayment
code = code.replace(
  /const handleFiatPayment = async \(\) => {[\s\S]*?};/,
  ''
);

// 8. Replace the massive UI block from "Existing Chainrails Modal" to the end of the page
const modalStartIndex = code.indexOf('{/* Existing Chainrails Modal */}');
const modalEndIndex = code.lastIndexOf('</div>');

if (modalStartIndex !== -1 && modalEndIndex !== -1) {
  const unifiedModalJSX = `
      {/* Unified Fiat & Crypto Payment Modal */}
      {pendingTx && pendingTx.type === 'buy' && (
        <UnifiedFiatModal
          isOpen={showUnifiedModal}
          onClose={() => { setShowUnifiedModal(false); setPendingTx(null); }}
          amount={(Math.ceil(pendingTx.shares * currentPrice * 1.01 * 100) / 100).toFixed(2)}
          sessionToken={sessionToken}
          onSuccess={handleDepositSuccess}
          userId={userId}
          project="wc26"
          destinationWallet="0xe1896D5E7547D63e79861d53A3DaCb066769Dfb1"
          shares={pendingTx.shares}
          itemDescription={\`\${pendingTx.shares} WC26 Vouchers\`}
        />
      )}
  `;
  code = code.substring(0, modalStartIndex) + unifiedModalJSX + code.substring(modalEndIndex);
}

fs.writeFileSync('app/bizswap/wc26/page.tsx', code);
console.log("update_wc26.js completed");

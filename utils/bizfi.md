# BizFi

> **On-chain Business Attestation Protocol on Base**

BizFi is a smart contract protocol for registering businesses on-chain with verifiable attestations using the Ethereum Attestation Service (EAS).

## Features

- **Business Registration** with USDC listing fees
- **Tier-based Pricing** ($10 / $35 / $60 / $120)
- **EIP-712 Signed Referral Discounts** for promotional pricing
- **On-chain Attestations** via EAS integration
- **Upgradeable Architecture** (UUPS pattern)
- **Role-based Access Control** (Admin, Attestor roles)

---

## Deployments

### Base Mainnet (Chain ID: 8453)

| Contract | Address |
|----------|---------|
| **BizFi Proxy** | [`0x7C24A938e086d01d252f1cde36783c105784c770`](https://basescan.org/address/0x7C24A938e086d01d252f1cde36783c105784c770) |
| **BizFi Implementation** | [`0x852B241E5423EF038a0F3B637dbc51f94CAfB9C4`](https://basescan.org/address/0x852B241E5423EF038a0F3B637dbc51f94CAfB9C4) |
| **USDC** | [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |
| **EAS** | [`0x4200000000000000000000000000000000000021`](https://basescan.org/address/0x4200000000000000000000000000000000000021) |
| **Schema UID** | `0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404` |

### Base Sepolia Testnet (Chain ID: 84532)

| Contract | Address |
|----------|---------||
| **BizFi Proxy** | [`0xc0789113A01E4cAF1C37F4E90D588987ebeD1eb0`](https://sepolia.basescan.org/address/0xc0789113A01E4cAF1C37F4E90D588987ebeD1eb0) |
| **BizFi Implementation** | [`0x40b2B0aB1eAC77C3840F46d16B96D4d16505a972`](https://sepolia.basescan.org/address/0x40b2B0aB1eAC77C3840F46d16B96D4d16505a972) |
| **MockUSDC (Payment Token)** | [`0x348d092d22E561F30CB14faE561B4D8DbEfB78c9`](https://sepolia.basescan.org/address/0x348d092d22E561F30CB14faE561B4D8DbEfB78c9) |
| **EAS** | [`0x4200000000000000000000000000000000000021`](https://sepolia.basescan.org/address/0x4200000000000000000000000000000000000021) |
| **Schema UID** | `0x9c6475ff61333d255b1b85b6ad7549ccf841770b4ea47cb42f7f495fadb8d3a4` |

**Get testnet mUSDC**: Call `faucet()` on [MockUSDC](https://sepolia.basescan.org/address/0x348d092d22E561F30CB14faE561B4D8DbEfB78c9#writeContract) to get 100 mUSDC instantly

### Configuration

| Parameter | Value |
|-----------|-------|
| **Schema UID** | `0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404` |
| **Owner/Admin** | `0x125629FAab442e459C1015FCBa50499D0aAB8EE0` |
| **Referral Signer** | `0x125629FAab442e459C1015FCBa50499D0aAB8EE0` |
| **Revenue Address** | `0x125629FAab442e459C1015FCBa50499D0aAB8EE0` |

### EAS Schema

```
string businessName, bytes32 metadataHash, uint8 tier, uint8 status, address owner, uint256 registeredAt
```

View on EAS: [Schema Explorer](https://base.easscan.org/schema/view/0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404)

---

## Business Tiers & Pricing

| Tier | Price (USDC) | Use Case |
|------|--------------|----------|
| **MICRO** | $10 | Small businesses, startups |
| **BUILDER** | $35 | Growing companies |
| **GROWTH** | $60 | Established businesses |
| **ENTERPRISE** | $120 | Large enterprises |

---

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/CryptoSmartNow/bizfi.git
cd bizfi

# Install dependencies
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Test with verbosity

```bash
forge test -vvv
```

---

## Integration

For detailed integration instructions, see **[docs/INTEGRATION.md](./docs/INTEGRATION.md)**.

### Quick Example

```javascript
import { ethers } from "ethers";

const BIZFI_PROXY = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// 1. Approve USDC ($10 for MICRO tier)
await usdcContract.approve(BIZFI_PROXY, 10_000_000);

// 2. Register business
const emptyReferral = {
  recipient: ethers.ZeroAddress,
  tier: 0,
  discountedPrice: 0,
  businessName: "",
  nonce: 0,
  deadline: 0
};

await bizfi.registerBusiness(
  "My Business",
  metadataHash,
  0, // MICRO tier
  emptyReferral,
  "0x"
);
```

---

## Project Structure

```
bizfi/
├── src/
│   ├── BizFi.sol          # Main contract
│   └── IBizFi.sol         # Interface
├── test/
│   └── BizFi.t.sol        # Test suite (44 tests)
├── script/
│   └── DeployBizFi.s.sol  # Deployment script
├── docs/
│   └── INTEGRATION.md     # Integration guide
└── foundry.toml           # Foundry config
```

---

## Development

### Run Tests

```bash
forge test
```

### Gas Report

```bash
forge test --gas-report
```

### Format Code

```bash
forge fmt
```

### Deploy (Dry Run)

```bash
source .env && forge script script/DeployBizFi.s.sol:DeployBizFi \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  -vvvv
```

### Deploy (Live)

```bash
source .env && forge script script/DeployBizFi.s.sol:DeployBizFi \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv
```

---

## Security

- **Upgradeable**: Uses UUPS proxy pattern for future upgrades
- **Access Control**: Role-based permissions (ADMIN_ROLE, ATTESTOR_ROLE)
- **Pausable**: Contract can be paused in emergencies
- **ReentrancyGuard**: Protected against reentrancy attacks
- **EIP-712**: Secure typed signatures for referral system

---

## License

MIT

---

## Links

- **Integration Guide**: [docs/INTEGRATION.md](./docs/INTEGRATION.md)
- **EAS Schema**: [base.easscan.org](https://base.easscan.org/schema/view/0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404)
- **Basescan**: [basescan.org](https://basescan.org/address/0x7C24A938e086d01d252f1cde36783c105784c770)

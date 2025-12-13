# BizFi Integration Guide

> **On-chain Business Attestation Protocol on Base**

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Contract Addresses](#contract-addresses)
4. [Data Structures](#data-structures)
5. [Getting Started](#getting-started)
6. [Business Registration](#business-registration)
7. [Fetching Business Data](#fetching-business-data)
8. [Business Management](#business-management)
9. [Referral System](#referral-system)
10. [Attestations](#attestations)
11. [Fetching Attestations](#fetching-attestations)
12. [Admin Functions](#admin-functions)
13. [API Reference](#api-reference)
14. [Events](#events)
15. [Error Handling](#error-handling)
16. [Complete Examples](#complete-examples)
17. [Security Considerations](#security-considerations)

---

## Overview

BizFi is a smart contract protocol for registering businesses on-chain with verifiable attestations using the **Ethereum Attestation Service (EAS)**. It provides:

- **Business Registration** with USDC listing fees
- **Tier-based Pricing** ($10, $35, $60, $120)
- **EIP-712 Signed Referral Discounts** for promotional pricing
- **On-chain Attestations** for business data verification
- **Upgradeable Architecture** (UUPS pattern)
- **Role-based Access Control** (Admin, Attestor roles)
- **Multiple Businesses per Address** - One wallet can own many businesses

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BizFi Architecture                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                │
│   │   Frontend  │      │   Backend   │      │    Admin    │                │
│   │   (User)    │      │  (Attestor) │      │   (Owner)   │                │
│   └──────┬──────┘      └──────┬──────┘      └──────┬──────┘                │
│          │                    │                    │                        │
│          │ Register           │ Create             │ Manage                 │
│          │ Business           │ Attestation        │ Contract               │
│          ▼                    ▼                    ▼                        │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │                    BizFi Proxy Contract                     │          │
│   │                                                             │          │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │          │
│   │  │  Business   │  │ Attestation │  │   Referral  │         │          │
│   │  │  Registry   │  │   System    │  │   System    │         │          │
│   │  └─────────────┘  └──────┬──────┘  └─────────────┘         │          │
│   │                          │                                  │          │
│   └──────────────────────────┼──────────────────────────────────┘          │
│                              │                                              │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │              Ethereum Attestation Service (EAS)             │          │
│   │                   (Base Mainnet)                            │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
│   External Dependencies:                                                    │
│   ┌──────────────┐                                                         │
│   │    USDC      │  Payments for listing fees                              │
│   └──────────────┘                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **BizFi Proxy** | Main entry point, stores all state |
| **Business Registry** | Stores business data, manages ownership |
| **Attestation System** | Creates/revokes attestations via EAS |
| **Referral System** | EIP-712 signed discounts for promotional pricing |
| **EAS** | Ethereum Attestation Service for on-chain attestations |
| **USDC** | Payment token for listing fees |

---

## Contract Addresses

### Base Mainnet

| Contract | Address |
|----------|---------|
| **BizFi Proxy** | [`0x7C24A938e086d01d252f1cde36783c105784c770`](https://basescan.org/address/0x7C24A938e086d01d252f1cde36783c105784c770) |
| **BizFi Implementation** | [`0x852B241E5423EF038a0F3B637dbc51f94CAfB9C4`](https://basescan.org/address/0x852B241E5423EF038a0F3B637dbc51f94CAfB9C4) |
| **USDC** | [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) |
| **EAS** | [`0x4200000000000000000000000000000000000021`](https://basescan.org/address/0x4200000000000000000000000000000000000021) |

> ⚠️ **Always interact with the Proxy address**, not the implementation.

### Configuration

| Parameter | Value |
|-----------|-------|
| **Schema UID** | `0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404` |
| **Owner/Admin** | `0x125629FAab442e459C1015FCBa50499D0aAB8EE0` |
| **Referral Signer** | `0x125629FAab442e459C1015FCBa50499D0aAB8EE0` |
| **Chain ID** | `8453` (Base Mainnet) |

### EAS Schema

The BizFi attestation schema registered on EAS:

```
string businessName, bytes32 metadataHash, uint8 tier, uint8 status, address owner, uint256 registeredAt
```

View on EAS: [Schema Explorer](https://base.easscan.org/schema/view/0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404)

---

## Data Structures

### Business

```solidity
struct Business {
    uint256 id;              // Unique business identifier
    address owner;           // Wallet that owns the business
    string name;             // Business name
    bytes32 metadataHash;    // Hash of off-chain data (IPFS CID, etc.)
    BusinessTier tier;       // Pricing tier (0-3)
    BusinessStatus status;   // Current status
    uint256 registeredAt;    // Registration timestamp
    uint256 updatedAt;       // Last update timestamp
    uint256 listingFeePaid;  // Amount paid in USDC (6 decimals)
}
```

### Business Tiers

| Tier | Enum Value | Price (USDC) | Raw Value (6 decimals) |
|------|------------|--------------|------------------------|
| **MICRO** | `0` | $10 | `10_000_000` |
| **BUILDER** | `1` | $35 | `35_000_000` |
| **GROWTH** | `2` | $60 | `60_000_000` |
| **ENTERPRISE** | `3` | $120 | `120_000_000` |

### Business Status

| Status | Enum Value | Description |
|--------|------------|-------------|
| **PENDING** | `0` | Awaiting activation |
| **ACTIVE** | `1` | Fully operational |
| **SUSPENDED** | `2` | Temporarily disabled |
| **INACTIVE** | `3` | Permanently disabled |

### Attestation Record

```solidity
struct AttestationRecord {
    bytes32 easUid;              // EAS attestation unique ID
    uint256 businessId;          // Associated business
    AttestationType attestationType; // Type of attestation
    bytes32 dataHash;            // Hash of attested data
    address attestor;            // Who created the attestation
    uint256 timestamp;           // When it was created
    bool isRevoked;              // Whether it's been revoked
}
```

### Attestation Types

| Type | Enum Value | Description | Example Data |
|------|------------|-------------|--------------|
| **GENERAL_INFO** | `0` | Basic business information | Company name, description, website |
| **TEAM_INFO** | `1` | Team composition | Team size, key members, roles |
| **FINANCE_INFO** | `2` | Financial records | Revenue, funding, financials |
| **KYC_KYB** | `3` | KYC/KYB verification | Identity verification status |
| **PROJECT_SUMMARY** | `4` | Project executive summary | Pitch deck, roadmap |

### Referral Discount

```solidity
struct ReferralDiscount {
    address recipient;       // Must match msg.sender
    BusinessTier tier;       // Must match registration tier
    uint256 discountedPrice; // Price in USDC (6 decimals)
    string businessName;     // Must match registration name
    uint256 nonce;           // Unique identifier (prevents replay)
    uint256 deadline;        // Unix timestamp expiration
}
```

---

## Getting Started

### Prerequisites

1. **USDC tokens** on Base for listing fees
2. **ETH on Base** for gas fees
3. A Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Get the Contract ABI

#### Option 1: Direct JSON (Recommended)

Download the ABI directly:

```bash
curl -o BizFi.json https://raw.githubusercontent.com/CryptoSmartNow/bizfi/main/abi/BizFi.json
```

Or fetch in your app:

```javascript
const BIZFI_ABI = await fetch(
  'https://raw.githubusercontent.com/CryptoSmartNow/bizfi/main/abi/BizFi.json'
).then(r => r.json());
```

#### Option 2: Build from Source

```bash
git clone https://github.com/CryptoSmartNow/bizfi.git
cd bizfi
forge build
# ABI at: out/BizFi.sol/BizFi.json
```

#### Option 3: From Basescan

Once verified, get ABI from:
https://basescan.org/address/0x7C24A938e086d01d252f1cde36783c105784c770#code

### Setting Up in JavaScript

```javascript
import { ethers } from "ethers";

// Contract addresses
const BIZFI_PROXY = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Initialize provider and signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Initialize contracts
const bizfi = new ethers.Contract(BIZFI_PROXY, BIZFI_ABI, signer);
const usdc = new ethers.Contract(USDC, ERC20_ABI, signer);
```

### Minimal ABI for Frontend

```javascript
const BIZFI_ABI = [
    // can retrieve from github instead
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
];
```

---

## Business Registration

### Business Tiers

| Tier | Enum Value | Price (USDC) | Use Case |
|------|------------|--------------|----------|
| **MICRO** | `0` | $10 | Small businesses, startups |
| **BUILDER** | `1` | $35 | Growing companies |
| **GROWTH** | `2` | $60 | Established businesses |
| **ENTERPRISE** | `3` | $120 | Large enterprises |

### Step 1: Approve USDC

Before registering, approve the BizFi contract to spend your USDC:

```javascript
const BIZFI_PROXY = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Approve exact amount (USDC has 6 decimals)
// $10 = 10_000_000, $35 = 35_000_000, etc.
const amount = 10_000_000; // $10 for MICRO tier

const usdcContract = new ethers.Contract(USDC, ERC20_ABI, signer);
await usdcContract.approve(BIZFI_PROXY, amount);
```

### Step 2: Prepare Metadata

Store your business data off-chain (IPFS recommended) and compute its hash:

```javascript
const businessData = {
  name: "My Business",
  description: "A Web3 startup",
  website: "https://mybusiness.com",
  logo: "ipfs://Qm...",
  socialLinks: {
    twitter: "@mybusiness",
    linkedin: "company/mybusiness"
  }
};

// Upload to IPFS and get CID
const cid = await uploadToIPFS(businessData);

// Convert CID to bytes32 hash
const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(cid));
// Or use the raw IPFS hash bytes
```

### Step 3: Register Business (Without Referral)

```javascript
const bizfi = new ethers.Contract(BIZFI_PROXY, BIZFI_ABI, signer);

// Empty referral struct (nonce = 0 signals no referral)
const emptyReferral = {
  recipient: ethers.ZeroAddress,
  tier: 0,
  discountedPrice: 0,
  businessName: "",
  nonce: 0,
  deadline: 0
};

const tx = await bizfi.registerBusiness(
  "My Business",           // name
  metadataHash,            // metadataHash (bytes32)
  0,                       // tier (0 = MICRO)
  emptyReferral,           // referral struct
  "0x"                     // empty signature
);

const receipt = await tx.wait();
// Get businessId from BusinessRegistered event
const event = receipt.logs.find(log => log.fragment?.name === "BusinessRegistered");
const businessId = event.args.businessId;
```

---

## Fetching Business Data

### Get a Single Business by ID

```javascript
async function getBusinessById(businessId) {
  try {
    const business = await bizfi.getBusiness(businessId);
    
    return {
      id: Number(business.id),
      owner: business.owner,
      name: business.name,
      metadataHash: business.metadataHash,
      tier: ["MICRO", "BUILDER", "GROWTH", "ENTERPRISE"][business.tier],
      tierValue: Number(business.tier),
      status: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"][business.status],
      statusValue: Number(business.status),
      registeredAt: new Date(Number(business.registeredAt) * 1000),
      updatedAt: new Date(Number(business.updatedAt) * 1000),
      listingFeePaid: Number(business.listingFeePaid) / 1_000_000 // Convert to USD
    };
  } catch (error) {
    if (error.message.includes("BusinessNotFound")) {
      return null;
    }
    throw error;
  }
}

// Usage
const business = await getBusinessById(1);
console.log(business);
// {
//   id: 1,
//   owner: "0x1234...",
//   name: "Acme Corp",
//   metadataHash: "0xabc...",
//   tier: "MICRO",
//   tierValue: 0,
//   status: "ACTIVE",
//   statusValue: 1,
//   registeredAt: Date(...),
//   updatedAt: Date(...),
//   listingFeePaid: 10
// }
```

### Get All Businesses by Owner

```javascript
async function getBusinessesByOwner(ownerAddress) {
  const businesses = await bizfi.getBusinessesByOwner(ownerAddress);
  
  return businesses.map(b => ({
    id: Number(b.id),
    owner: b.owner,
    name: b.name,
    metadataHash: b.metadataHash,
    tier: ["MICRO", "BUILDER", "GROWTH", "ENTERPRISE"][b.tier],
    status: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"][b.status],
    registeredAt: new Date(Number(b.registeredAt) * 1000),
    updatedAt: new Date(Number(b.updatedAt) * 1000),
    listingFeePaid: Number(b.listingFeePaid) / 1_000_000
  }));
}

// Usage
const myBusinesses = await getBusinessesByOwner(signer.address);
console.log(`You own ${myBusinesses.length} businesses`);
myBusinesses.forEach(b => console.log(`- ${b.name} (ID: ${b.id})`));
```

### Get Only Business IDs for Owner

```javascript
// More gas-efficient if you only need IDs
async function getBusinessIds(ownerAddress) {
  const ids = await bizfi.getBusinessIdsByOwner(ownerAddress);
  return ids.map(id => Number(id));
}

// Usage
const businessIds = await getBusinessIds("0x1234...");
// [1, 5, 12] - array of business IDs owned by this address
```

### Check if Address Has Any Business

```javascript
async function checkBusinessOwnership(address) {
  const [hasRegistration, count] = await bizfi.hasBusinessRegistration(address);
  
  return {
    hasBusinesses: hasRegistration,
    businessCount: Number(count)
  };
}

// Usage
const { hasBusinesses, businessCount } = await checkBusinessOwnership(signer.address);
if (hasBusinesses) {
  console.log(`Address owns ${businessCount} business(es)`);
} else {
  console.log("No businesses registered");
}
```

### Check Ownership of Specific Business

```javascript
async function checkOwnsSpecificBusiness(ownerAddress, businessId) {
  return await bizfi.ownsBusinessId(ownerAddress, businessId);
}

// Usage
const isOwner = await checkOwnsSpecificBusiness(signer.address, 5);
if (isOwner) {
  console.log("You own business #5");
}
```

### Get Total Registered Businesses

```javascript
async function getTotalBusinessCount() {
  const total = await bizfi.getTotalBusinesses();
  return Number(total);
}

// Usage
const total = await getTotalBusinessCount();
console.log(`Total businesses registered: ${total}`);
```

### Get Current Listing Fees

```javascript
async function getListingFees() {
  const [micro, builder, growth, enterprise] = await bizfi.getAllListingFees();
  
  return {
    MICRO: Number(micro) / 1_000_000,
    BUILDER: Number(builder) / 1_000_000,
    GROWTH: Number(growth) / 1_000_000,
    ENTERPRISE: Number(enterprise) / 1_000_000
  };
}

// Usage
const fees = await getListingFees();
console.log(fees);
// { MICRO: 10, BUILDER: 35, GROWTH: 60, ENTERPRISE: 120 }

// Or get single tier fee
const microFee = await bizfi.getListingFee(0); // Returns 10_000_000
```

---

## Business Management

### Update Business Metadata

Only the business owner can update metadata:

```javascript
async function updateMetadata(businessId, newMetadata) {
  // Hash the new metadata
  const metadataHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(newMetadata))
  );
  
  const tx = await bizfi.updateBusinessMetadata(businessId, metadataHash);
  await tx.wait();
  
  console.log(`Updated metadata for business #${businessId}`);
}

// Usage
await updateMetadata(1, {
  name: "Acme Corp",
  description: "Updated description",
  website: "https://new-website.com",
  logo: "ipfs://QmNewHash..."
});
```

### Update Business Name

```javascript
async function updateBusinessName(businessId, newName) {
  const tx = await bizfi.updateBusinessName(businessId, newName);
  await tx.wait();
  
  console.log(`Renamed business #${businessId} to "${newName}"`);
}

// Usage
await updateBusinessName(1, "Acme Corporation");
```

### Listen for Business Events

```javascript
// Listen for new registrations
bizfi.on("BusinessRegistered", (businessId, owner, name, metadataHash) => {
  console.log(`New business: ${name} (ID: ${businessId}) by ${owner}`);
});

// Listen for updates
bizfi.on("BusinessUpdated", (businessId, newMetadataHash) => {
  console.log(`Business #${businessId} metadata updated`);
});

// Filter events by owner
const myFilter = bizfi.filters.BusinessRegistered(null, signer.address);
bizfi.on(myFilter, (businessId, owner, name) => {
  console.log(`You registered: ${name} (ID: ${businessId})`);
});
```

### Query Historical Events

```javascript
async function getRegistrationHistory(fromBlock = 0) {
  const filter = bizfi.filters.BusinessRegistered();
  const events = await bizfi.queryFilter(filter, fromBlock);
  
  return events.map(e => ({
    businessId: Number(e.args.businessId),
    owner: e.args.owner,
    name: e.args.name,
    metadataHash: e.args.metadataHash,
    blockNumber: e.blockNumber,
    transactionHash: e.transactionHash
  }));
}

// Get all registrations in last 1000 blocks
const currentBlock = await provider.getBlockNumber();
const recentRegistrations = await getRegistrationHistory(currentBlock - 1000);
```

---

## Referral System

The referral system uses **EIP-712 typed signatures** to provide secure, off-chain referral discounts. This approach:

- ✅ Keeps referral codes **off-chain** (not stored in contract)
- ✅ Prevents replay attacks via **unique nonces**
- ✅ Has **expiration times** for limited-time offers
- ✅ Is **cryptographically secure** - only the authorized signer can create valid referrals

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REFERRAL FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Admin/Backend creates referral discount data                    │
│     ↓                                                               │
│  2. Signs it with EIP-712 using the referralSigner private key      │
│     ↓                                                               │
│  3. Sends signature + referral data to user (email, link, etc.)     │
│     ↓                                                               │
│  4. User calls registerBusiness() with referral + signature         │
│     ↓                                                               │
│  5. Contract verifies signature matches authorized signer           │
│     ↓                                                               │
│  6. User pays discounted price instead of full price                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Referral Data Structure

```solidity
struct ReferralDiscount {
    address recipient;       // Must match msg.sender registering
    BusinessTier tier;       // Must match registration tier
    uint256 discountedPrice; // Price in USDC (6 decimals)
    string businessName;     // Must match registration name
    uint256 nonce;           // Unique identifier (use timestamp or UUID)
    uint256 deadline;        // Unix timestamp when offer expires
}
```

### Creating a Referral (Backend/Admin)

```javascript
// This runs on your backend with the referralSigner private key

const DOMAIN = {
  name: "BizFi",
  version: "1",
  chainId: 8453, // Base mainnet
  verifyingContract: "0x7C24A938e086d01d252f1cde36783c105784c770"
};

const TYPES = {
  ReferralDiscount: [
    { name: "recipient", type: "address" },
    { name: "tier", type: "uint8" },
    { name: "discountedPrice", type: "uint256" },
    { name: "businessName", type: "string" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

async function createReferral(
  recipientAddress,
  businessName,
  tier,
  discountPercent, // e.g., 20 for 20% off
  validForDays = 7
) {
  // Listing fees (USDC 6 decimals)
  const FEES = {
    0: 10_000_000,   // MICRO: $10
    1: 35_000_000,   // BUILDER: $35
    2: 60_000_000,   // GROWTH: $60
    3: 120_000_000   // ENTERPRISE: $120
  };

  const fullPrice = FEES[tier];
  const discountedPrice = fullPrice - (fullPrice * discountPercent / 100);
  
  const referral = {
    recipient: recipientAddress,
    tier: tier,
    discountedPrice: discountedPrice,
    businessName: businessName,
    nonce: Date.now(), // Use timestamp as unique nonce
    deadline: Math.floor(Date.now() / 1000) + (validForDays * 24 * 60 * 60)
  };

  // Sign with referralSigner wallet
  const signature = await referralSignerWallet.signTypedData(
    DOMAIN,
    TYPES,
    referral
  );

  return { referral, signature };
}

// Example: Create 20% discount for a MICRO tier registration
const { referral, signature } = await createReferral(
  "0x1234...userAddress",
  "Acme Corp",
  0, // MICRO
  20 // 20% discount ($10 → $8)
);
```

### Using a Referral (Frontend/User)

```javascript
// User received referral data and signature from backend

const referral = {
  recipient: "0x1234...myAddress",  // Must be your address
  tier: 0,                           // MICRO
  discountedPrice: 8_000_000,        // $8 (20% off $10)
  businessName: "Acme Corp",         // Must match what you register
  nonce: 1702300000000,              // Unique nonce
  deadline: 1703000000               // Expiration timestamp
};

const signature = "0x..."; // From backend

// Step 1: Approve the DISCOUNTED amount
const usdcContract = new ethers.Contract(USDC, ERC20_ABI, signer);
await usdcContract.approve(BIZFI_PROXY, referral.discountedPrice);

// Step 2: Register with referral
const bizfi = new ethers.Contract(BIZFI_PROXY, BIZFI_ABI, signer);

const tx = await bizfi.registerBusiness(
  "Acme Corp",                 // MUST match referral.businessName
  metadataHash,
  0,                           // MUST match referral.tier
  referral,                    // Full referral struct
  signature                    // EIP-712 signature
);

await tx.wait();
```

### Referral Validation Rules

The contract enforces:

| Check | Error If Failed |
|-------|-----------------|
| Signature recovers to `referralSigner` | `InvalidReferralSignature` |
| `block.timestamp <= deadline` | `ReferralExpired` |
| `nonce` not already used | `ReferralNonceAlreadyUsed` |
| `referral.recipient == msg.sender` | `ReferralRecipientMismatch` |
| `referral.tier == tier` parameter | `ReferralTierMismatch` |
| `referral.businessName == name` parameter | `ReferralBusinessNameMismatch` |
| `discountedPrice <= fullPrice` | `ReferralPriceExceedsFullPrice` |
| `referralSigner != address(0)` | `ReferralSignerNotSet` |

### Checking Referral Status

```javascript
// Check if a nonce has been used
const isUsed = await bizfi.usedReferralNonces(nonce);

// Get current referral signer
const signer = await bizfi.referralSigner();

// Get listing fee for a tier
const fee = await bizfi.listingFees(0); // Returns 10_000_000 for MICRO
```

---

## Attestations

Attestations are verifiable claims about a business, created by authorized attestors and stored on the Ethereum Attestation Service (EAS).

### How Attestations Work

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ATTESTATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Business registers on BizFi → Gets businessId                           │
│                                                                             │
│  2. Business submits verification data off-chain to Attestor                │
│     (Documents, KYC, financials, etc.)                                      │
│                                                                             │
│  3. Attestor verifies data and hashes it                                    │
│     dataHash = keccak256(verificationData)                                  │
│                                                                             │
│  4. Attestor calls createAttestation() with:                                │
│     - businessId                                                            │
│     - attestationType (GENERAL_INFO, KYC_KYB, etc.)                        │
│     - dataHash                                                              │
│     - recipient (business owner address)                                    │
│     - expirationTime (0 = never expires)                                    │
│                                                                             │
│  5. BizFi creates attestation on EAS and stores record                      │
│     Returns: attestationId (internal) + easUid (EAS UID)                    │
│                                                                             │
│  6. Anyone can verify the attestation:                                      │
│     - On BizFi: getAttestation(attestationId)                               │
│     - On EAS: eas.getAttestation(easUid)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Attestation Types Explained

| Type | Purpose | Typical Verification Process |
|------|---------|------------------------------|
| **GENERAL_INFO** | Basic business verification | Verify business name, website, description matches reality |
| **TEAM_INFO** | Team verification | Verify team size, LinkedIn profiles, key members |
| **FINANCE_INFO** | Financial verification | Review financials, revenue, funding status |
| **KYC_KYB** | Identity verification | KYC for individuals, KYB for business entity |
| **PROJECT_SUMMARY** | Project viability | Review pitch deck, roadmap, technical feasibility |

### Creating Attestations (Attestors Only)

> ⚠️ Only addresses with `ATTESTOR_ROLE` can create attestations.

```javascript
// Attestor backend code
async function createBusinessAttestation(
  businessId,
  attestationType,
  verificationData,
  businessOwnerAddress,
  expirationDays = 0 // 0 = never expires
) {
  // Hash the verification data
  const dataHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(verificationData))
  );
  
  // Calculate expiration (0 for no expiration)
  const expirationTime = expirationDays > 0
    ? Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60)
    : 0;
  
  // Create attestation
  const tx = await bizfi.createAttestation(
    businessId,
    attestationType, // 0-4
    dataHash,
    businessOwnerAddress,
    expirationTime
  );
  
  const receipt = await tx.wait();
  
  // Extract attestation details from event
  const event = receipt.logs.find(
    log => log.fragment?.name === "AttestationCreated"
  );
  
  return {
    attestationId: Number(event.args.attestationId),
    easUid: event.args.easUid,
    businessId: Number(event.args.businessId),
    attestationType: event.args.attestationType,
    attestor: event.args.attestor
  };
}

// Usage: Create KYC attestation
const result = await createBusinessAttestation(
  1, // businessId
  3, // KYC_KYB
  {
    kycProvider: "SumSub",
    verificationDate: "2024-12-01",
    level: "enhanced",
    status: "approved"
  },
  "0xBusinessOwnerAddress...",
  365 // Expires in 1 year
);

console.log(`Attestation created: ID=${result.attestationId}, EAS=${result.easUid}`);
```

### Revoking Attestations (Attestors Only)

```javascript
async function revokeAttestation(attestationId) {
  const tx = await bizfi.revokeAttestation(attestationId);
  await tx.wait();
  console.log(`Attestation #${attestationId} revoked`);
}
```

---

## Fetching Attestations

### Get Attestation by ID

```javascript
async function getAttestationById(attestationId) {
  try {
    const record = await bizfi.getAttestation(attestationId);
    
    return {
      easUid: record.easUid,
      businessId: Number(record.businessId),
      attestationType: ["GENERAL_INFO", "TEAM_INFO", "FINANCE_INFO", "KYC_KYB", "PROJECT_SUMMARY"][record.attestationType],
      attestationTypeValue: Number(record.attestationType),
      dataHash: record.dataHash,
      attestor: record.attestor,
      timestamp: new Date(Number(record.timestamp) * 1000),
      isRevoked: record.isRevoked
    };
  } catch (error) {
    if (error.message.includes("AttestationNotFound")) {
      return null;
    }
    throw error;
  }
}

// Usage
const attestation = await getAttestationById(1);
console.log(attestation);
// {
//   easUid: "0x...",
//   businessId: 1,
//   attestationType: "KYC_KYB",
//   attestationTypeValue: 3,
//   dataHash: "0x...",
//   attestor: "0x...",
//   timestamp: Date(...),
//   isRevoked: false
// }
```

### Get Attestation by EAS UID

```javascript
async function getAttestationByEasUid(easUid) {
  const record = await bizfi.getAttestationByEasUid(easUid);
  // Same structure as above
  return formatAttestation(record);
}

// Usage
const attestation = await getAttestationByEasUid("0xabc123...");
```

### Get All Attestations for a Business

```javascript
async function getBusinessAttestations(businessId) {
  // Get all attestation IDs
  const attestationIds = await bizfi.getBusinessAttestationIds(businessId);
  
  // Fetch each attestation
  const attestations = await Promise.all(
    attestationIds.map(async (id) => {
      const record = await bizfi.getAttestation(Number(id));
      return {
        id: Number(id),
        easUid: record.easUid,
        type: ["GENERAL_INFO", "TEAM_INFO", "FINANCE_INFO", "KYC_KYB", "PROJECT_SUMMARY"][record.attestationType],
        dataHash: record.dataHash,
        attestor: record.attestor,
        timestamp: new Date(Number(record.timestamp) * 1000),
        isRevoked: record.isRevoked
      };
    })
  );
  
  return attestations;
}

// Usage
const attestations = await getBusinessAttestations(1);
console.log(`Business #1 has ${attestations.length} attestations`);
attestations.forEach(a => {
  console.log(`- ${a.type}: ${a.isRevoked ? "REVOKED" : "VALID"}`);
});
```

### Check if Business Has Specific Attestation Type

```javascript
async function checkAttestationType(businessId, attestationType) {
  const [exists, easUid] = await bizfi.hasAttestationType(businessId, attestationType);
  
  return {
    hasAttestation: exists,
    easUid: exists ? easUid : null
  };
}

// Check if business has KYC verification
const { hasAttestation, easUid } = await checkAttestationType(1, 3); // 3 = KYC_KYB
if (hasAttestation) {
  console.log(`Business is KYC verified (EAS: ${easUid})`);
} else {
  console.log("Business not KYC verified");
}
```

### Get Total Attestations Count

```javascript
const totalAttestations = await bizfi.getTotalAttestations();
console.log(`Total attestations: ${Number(totalAttestations)}`);
```

### Verify Attestation on EAS Directly

```javascript
const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
const EAS_ABI = [
  "function getAttestation(bytes32 uid) view returns (tuple(bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))"
];

async function verifyOnEAS(easUid) {
  const eas = new ethers.Contract(EAS_ADDRESS, EAS_ABI, provider);
  const attestation = await eas.getAttestation(easUid);
  
  return {
    uid: attestation.uid,
    schema: attestation.schema,
    createdAt: new Date(Number(attestation.time) * 1000),
    expiresAt: attestation.expirationTime > 0 
      ? new Date(Number(attestation.expirationTime) * 1000) 
      : null,
    isRevoked: attestation.revocationTime > 0,
    revokedAt: attestation.revocationTime > 0 
      ? new Date(Number(attestation.revocationTime) * 1000) 
      : null,
    recipient: attestation.recipient,
    attester: attestation.attester,
    data: attestation.data
  };
}

// Decode the attestation data
function decodeAttestationData(data) {
  const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
    ["uint256", "uint8", "bytes32", "address"], // businessId, attestationType, dataHash, owner
    data
  );
  
  return {
    businessId: Number(decoded[0]),
    attestationType: Number(decoded[1]),
    dataHash: decoded[2],
    businessOwner: decoded[3]
  };
}
```

### Full Business Verification Check

```javascript
async function getFullBusinessVerification(businessId) {
  const business = await bizfi.getBusiness(businessId);
  const attestationIds = await bizfi.getBusinessAttestationIds(businessId);
  
  const verificationStatus = {
    businessId: Number(businessId),
    businessName: business.name,
    owner: business.owner,
    status: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"][business.status],
    tier: ["MICRO", "BUILDER", "GROWTH", "ENTERPRISE"][business.tier],
    attestations: {
      GENERAL_INFO: false,
      TEAM_INFO: false,
      FINANCE_INFO: false,
      KYC_KYB: false,
      PROJECT_SUMMARY: false
    },
    attestationDetails: []
  };
  
  // Check each attestation type
  const types = ["GENERAL_INFO", "TEAM_INFO", "FINANCE_INFO", "KYC_KYB", "PROJECT_SUMMARY"];
  for (let i = 0; i < types.length; i++) {
    const [exists, easUid] = await bizfi.hasAttestationType(businessId, i);
    if (exists) {
      verificationStatus.attestations[types[i]] = true;
      
      const record = await bizfi.getAttestationByEasUid(easUid);
      if (!record.isRevoked) {
        verificationStatus.attestationDetails.push({
          type: types[i],
          easUid: easUid,
          attestor: record.attestor,
          timestamp: new Date(Number(record.timestamp) * 1000)
        });
      }
    }
  }
  
  // Calculate verification score
  const verifiedCount = Object.values(verificationStatus.attestations).filter(v => v).length;
  verificationStatus.verificationScore = `${verifiedCount}/5`;
  verificationStatus.isFullyVerified = verifiedCount === 5;
  
  return verificationStatus;
}

// Usage
const verification = await getFullBusinessVerification(1);
console.log(verification);
// {
//   businessId: 1,
//   businessName: "Acme Corp",
//   owner: "0x...",
//   status: "ACTIVE",
//   tier: "MICRO",
//   attestations: {
//     GENERAL_INFO: true,
//     TEAM_INFO: false,
//     FINANCE_INFO: false,
//     KYC_KYB: true,
//     PROJECT_SUMMARY: false
//   },
//   verificationScore: "2/5",
//   isFullyVerified: false,
//   attestationDetails: [...]
// }
```

---

## Admin Functions

These functions require specific roles (ADMIN_ROLE or ATTESTOR_ROLE).

### Role Constants

```solidity
bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
```

### Admin Functions (ADMIN_ROLE Required)

```javascript
// Update listing fee for a tier
await bizfi.setListingFee(0, 15_000_000); // Set MICRO to $15

// Update referral signer
await bizfi.setReferralSigner("0xNewSignerAddress...");

// Update revenue address (where fees go)
await bizfi.setRevenueAddress("0xNewRevenueAddress...");

// Change business status
await bizfi.setBusinessStatus(businessId, 2); // Set to SUSPENDED

// Update EAS contract address
await bizfi.setEAS("0xNewEASAddress...");

// Update schema UID
await bizfi.setSchemaUid("0xNewSchemaUid...");

// Pause/Unpause contract
await bizfi.pause();
await bizfi.unpause();
```

### Attestor Functions (ATTESTOR_ROLE Required)

```javascript
// Create attestation
await bizfi.createAttestation(businessId, attestationType, dataHash, recipient, expiration);

// Revoke attestation
await bizfi.revokeAttestation(attestationId);
```

### Granting Roles

```javascript
// Grant ATTESTOR_ROLE to an address
const ATTESTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ATTESTOR_ROLE"));
await bizfi.grantRole(ATTESTOR_ROLE, "0xAttestorAddress...");

// Grant ADMIN_ROLE
const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
await bizfi.grantRole(ADMIN_ROLE, "0xAdminAddress...");

// Check if address has role
const hasRole = await bizfi.hasRole(ATTESTOR_ROLE, "0xAddress...");
```

---

## API Reference

### Read Functions

#### Business Queries

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getBusiness` | `uint256 businessId` | `Business` | Get business by ID |
| `getBusinessesByOwner` | `address owner` | `Business[]` | Get all businesses owned by address |
| `getBusinessIdsByOwner` | `address owner` | `uint256[]` | Get business IDs for owner |
| `hasBusinessRegistration` | `address owner` | `bool, uint256` | Check if has businesses + count |
| `ownsBusinessId` | `address, uint256` | `bool` | Check specific ownership |
| `getTotalBusinesses` | - | `uint256` | Total registered businesses |

#### Attestation Queries

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getAttestation` | `uint256 attestationId` | `AttestationRecord` | Get attestation by ID |
| `getAttestationByEasUid` | `bytes32 easUid` | `AttestationRecord` | Get by EAS UID |
| `getBusinessAttestationIds` | `uint256 businessId` | `uint256[]` | Get attestation IDs for business |
| `hasAttestationType` | `uint256, AttestationType` | `bool, bytes32` | Check if type exists |
| `getTotalAttestations` | - | `uint256` | Total attestations created |

#### Fee Queries

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getListingFee` | `BusinessTier tier` | `uint256` | Fee for specific tier |
| `getAllListingFees` | - | `uint256, uint256, uint256, uint256` | All tier fees |
| `totalRevenue` | - | `uint256` | Total USDC collected |

#### Referral Queries

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `referralSigner` | - | `address` | Current referral signer |
| `isReferralNonceUsed` | `uint256 nonce` | `bool` | Check if nonce used |
| `DOMAIN_SEPARATOR` | - | `bytes32` | EIP-712 domain separator |

### Write Functions

#### Business Management

| Function | Access | Description |
|----------|--------|-------------|
| `registerBusiness` | Public | Register new business with USDC payment |
| `updateBusinessMetadata` | Owner | Update business metadata hash |
| `updateBusinessName` | Owner | Update business name |

#### Admin Functions

| Function | Access | Description |
|----------|--------|-------------|
| `setListingFee` | ADMIN_ROLE | Update tier pricing |
| `setReferralSigner` | ADMIN_ROLE | Update referral signer |
| `setRevenueAddress` | ADMIN_ROLE | Update revenue recipient |
| `setBusinessStatus` | ADMIN_ROLE | Change business status |
| `setEAS` | ADMIN_ROLE | Update EAS contract |
| `setSchemaUid` | ADMIN_ROLE | Update schema UID |
| `pause` | ADMIN_ROLE | Pause contract |
| `unpause` | ADMIN_ROLE | Unpause contract |

#### Attestor Functions

| Function | Access | Description |
|----------|--------|-------------|
| `createAttestation` | ATTESTOR_ROLE | Create new attestation |
| `revokeAttestation` | ATTESTOR_ROLE | Revoke existing attestation |

---

## Error Handling

### All Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `BusinessNotFound` | Business ID doesn't exist | Verify the business ID |
| `NotBusinessOwner` | Caller doesn't own the business | Use the owner's wallet |
| `InvalidAddress` | Zero address provided | Provide valid address |
| `InvalidMetadataHash` | Empty bytes32 for metadata | Provide valid hash |
| `BusinessNotActive` | Business is not in ACTIVE status | Contact admin to reactivate |
| `AttestationNotFound` | Attestation ID doesn't exist | Verify the attestation ID |
| `AttestationAlreadyRevoked` | Trying to revoke already revoked | Check attestation status first |
| `AttestationTypeAlreadyExists` | Business already has this attestation type | Revoke existing first |
| `InvalidSchemaUid` | Empty schema UID | Provide valid schema |
| `EASAttestationFailed` | EAS returned zero UID | Check EAS configuration |
| `InsufficientAllowance` | Not enough USDC approved | Call `usdc.approve()` first |
| `PaymentFailed` | USDC transfer failed | Check balance and allowance |
| `InvalidUSDCAddress` | USDC address is zero | Configure valid USDC address |
| `InvalidReferralSignature` | Signature doesn't match signer | Check signature creation |
| `ReferralExpired` | Referral deadline passed | Request new referral |
| `ReferralNonceAlreadyUsed` | Nonce already consumed | Use new nonce |
| `ReferralRecipientMismatch` | msg.sender ≠ referral.recipient | Use correct wallet |
| `ReferralTierMismatch` | Registration tier ≠ referral tier | Use matching tier |
| `ReferralBusinessNameMismatch` | Registration name ≠ referral name | Use exact name |
| `ReferralPriceExceedsFullPrice` | Discounted > full price | Fix referral price |
| `ReferralSignerNotSet` | No referral signer configured | Admin must set signer |

### Error Handling in JavaScript

```javascript
async function safeRegisterBusiness(name, metadataHash, tier) {
  try {
    const tx = await bizfi.registerBusiness(name, metadataHash, tier, emptyReferral, "0x");
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    // Parse custom errors
    if (error.message.includes("InsufficientAllowance")) {
      return { success: false, error: "Please approve USDC first" };
    }
    if (error.message.includes("InvalidMetadataHash")) {
      return { success: false, error: "Metadata hash cannot be empty" };
    }
    if (error.message.includes("execution reverted")) {
      // Try to decode the error
      const reason = error.reason || "Transaction failed";
      return { success: false, error: reason };
    }
    throw error;
  }
}

// With ethers v6 custom error decoding
function decodeError(error, contract) {
  try {
    const decodedError = contract.interface.parseError(error.data);
    return decodedError.name;
  } catch {
    return "Unknown error";
  }
}
```

---

## Events

### Business Events

```solidity
// Emitted when a new business is registered
event BusinessRegistered(
    uint256 indexed businessId,
    address indexed owner,
    string name,
    bytes32 metadataHash
);

// Emitted when business metadata is updated
event BusinessUpdated(
    uint256 indexed businessId,
    bytes32 newMetadataHash
);

// Emitted when business status changes
event BusinessStatusChanged(
    uint256 indexed businessId,
    BusinessStatus oldStatus,
    BusinessStatus newStatus
);
```

### Payment Events

```solidity
// Emitted when listing fee is paid
event ListingFeePaid(
    uint256 indexed businessId,
    address indexed payer,
    BusinessTier tier,
    uint256 amount
);

// Emitted when referral discount is used
event ReferralDiscountUsed(
    uint256 indexed businessId,
    address indexed recipient,
    uint256 nonce,
    uint256 fullPrice,
    uint256 discountedPrice
);
```

### Attestation Events

```solidity
// Emitted when attestation is created
event AttestationCreated(
    uint256 indexed attestationId,
    uint256 indexed businessId,
    bytes32 indexed easUid,
    AttestationType attestationType,
    address attestor
);

// Emitted when attestation is revoked
event AttestationRevoked(
    uint256 indexed attestationId,
    bytes32 indexed easUid
);
```

### Admin Events

```solidity
event SchemaUidUpdated(bytes32 oldSchemaUid, bytes32 newSchemaUid);
event EASUpdated(address oldEas, address newEas);
event RevenueAddressUpdated(address oldAddress, address newAddress);
event ListingFeeUpdated(BusinessTier tier, uint256 oldFee, uint256 newFee);
event ReferralSignerUpdated(address oldSigner, address newSigner);
```

### Listening to Events

```javascript
// Listen to all business registrations
bizfi.on("BusinessRegistered", (businessId, owner, name, metadataHash, event) => {
  console.log(`New business registered:`);
  console.log(`  ID: ${businessId}`);
  console.log(`  Owner: ${owner}`);
  console.log(`  Name: ${name}`);
  console.log(`  Tx: ${event.log.transactionHash}`);
});

// Listen to attestations for a specific business
const filter = bizfi.filters.AttestationCreated(null, 1); // businessId = 1
bizfi.on(filter, (attestationId, businessId, easUid, attestationType, attestor) => {
  console.log(`New attestation for business #${businessId}: Type ${attestationType}`);
});

// Query historical events
const fromBlock = 1000000;
const events = await bizfi.queryFilter(
  bizfi.filters.BusinessRegistered(),
  fromBlock
);
```

---

## Complete Examples

### Full Business Registration Flow

```javascript
import { ethers } from "ethers";

const BIZFI_PROXY = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

class BizFiClient {
  constructor(signer) {
    this.signer = signer;
    this.bizfi = new ethers.Contract(BIZFI_PROXY, BIZFI_ABI, signer);
    this.usdc = new ethers.Contract(USDC, ERC20_ABI, signer);
  }
  
  // Register a new business
  async registerBusiness(businessName, metadata, tier, referral = null, signature = "0x") {
    // 1. Get the required fee
    const fee = referral ? referral.discountedPrice : await this.bizfi.getListingFee(tier);
    
    // 2. Check USDC balance
    const balance = await this.usdc.balanceOf(this.signer.address);
    if (balance < fee) {
      throw new Error(`Insufficient USDC. Need ${Number(fee) / 1e6}, have ${Number(balance) / 1e6}`);
    }
    
    // 3. Approve USDC if needed
    const allowance = await this.usdc.allowance(this.signer.address, BIZFI_PROXY);
    if (allowance < fee) {
      console.log("Approving USDC...");
      const approveTx = await this.usdc.approve(BIZFI_PROXY, fee);
      await approveTx.wait();
    }
    
    // 4. Hash metadata (can be IPFS CID, URL, or JSON)
    const metadataHash = ethers.keccak256(
      ethers.toUtf8Bytes(typeof metadata === 'string' ? metadata : JSON.stringify(metadata))
    );
    
    // 5. Prepare referral struct
    const emptyReferral = {
      recipient: ethers.ZeroAddress,
      tier: 0,
      discountedPrice: 0,
      businessName: "",
      nonce: 0,
      deadline: 0
    };
    
    // 6. Register
    console.log(`Registering "${businessName}"...`);
    const tx = await this.bizfi.registerBusiness(
      businessName,
      metadataHash,
      tier,
      referral || emptyReferral,
      signature
    );
    
    const receipt = await tx.wait();
    
    // 7. Extract business ID from event
    const iface = new ethers.Interface(BIZFI_ABI);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "BusinessRegistered") {
          return {
            businessId: Number(parsed.args.businessId),
            name: parsed.args.name,
            metadataHash: parsed.args.metadataHash,
            transactionHash: receipt.hash
          };
        }
      } catch {}
    }
  }
  
  // Get business details
  async getBusiness(businessId) {
    const b = await this.bizfi.getBusiness(businessId);
    return {
      id: Number(b.id),
      owner: b.owner,
      name: b.name,
      metadataHash: b.metadataHash,
      tier: ["MICRO", "BUILDER", "GROWTH", "ENTERPRISE"][b.tier],
      status: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"][b.status],
      registeredAt: new Date(Number(b.registeredAt) * 1000),
      listingFeePaid: Number(b.listingFeePaid) / 1e6
    };
  }
  
  // Get all businesses for connected wallet
  async getMyBusinesses() {
    const businesses = await this.bizfi.getBusinessesByOwner(this.signer.address);
    return businesses.map(b => ({
      id: Number(b.id),
      name: b.name,
      tier: ["MICRO", "BUILDER", "GROWTH", "ENTERPRISE"][b.tier],
      status: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"][b.status]
    }));
  }
  
  // Get all attestations for a business
  async getAttestations(businessId) {
    const ids = await this.bizfi.getBusinessAttestationIds(businessId);
    const attestations = [];
    
    for (const id of ids) {
      const a = await this.bizfi.getAttestation(Number(id));
      attestations.push({
        id: Number(id),
        easUid: a.easUid,
        type: ["GENERAL_INFO", "TEAM_INFO", "FINANCE_INFO", "KYC_KYB", "PROJECT_SUMMARY"][a.attestationType],
        attestor: a.attestor,
        timestamp: new Date(Number(a.timestamp) * 1000),
        isRevoked: a.isRevoked
      });
    }
    
    return attestations;
  }
  
  // Check verification status
  async getVerificationStatus(businessId) {
    const types = ["GENERAL_INFO", "TEAM_INFO", "FINANCE_INFO", "KYC_KYB", "PROJECT_SUMMARY"];
    const status = {};
    
    for (let i = 0; i < types.length; i++) {
      const [exists] = await this.bizfi.hasAttestationType(businessId, i);
      status[types[i]] = exists;
    }
    
    return status;
  }
}

// Usage
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const client = new BizFiClient(signer);

// Register
const result = await client.registerBusiness(
  "My Awesome Startup",
  { description: "Web3 fintech", website: "https://example.com" },
  0 // MICRO tier
);
console.log(`Registered! Business ID: ${result.businessId}`);

// Fetch
const business = await client.getBusiness(result.businessId);
console.log(business);

// Check attestations
const attestations = await client.getAttestations(result.businessId);
console.log(`Has ${attestations.length} attestations`);
```

### Referral System Backend Service

```javascript
import { ethers } from "ethers";

class ReferralService {
  constructor(signerPrivateKey) {
    this.signer = new ethers.Wallet(signerPrivateKey);
    
    this.domain = {
      name: "BizFi",
      version: "1",
      chainId: 8453, // Base mainnet
      verifyingContract: "0x7C24A938e086d01d252f1cde36783c105784c770"
    };
    
    this.types = {
      ReferralDiscount: [
        { name: "recipient", type: "address" },
        { name: "tier", type: "uint8" },
        { name: "discountedPrice", type: "uint256" },
        { name: "businessName", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };
    
    this.tierPrices = {
      0: 10_000_000,   // MICRO: $10
      1: 35_000_000,   // BUILDER: $35
      2: 60_000_000,   // GROWTH: $60
      3: 120_000_000   // ENTERPRISE: $120
    };
  }
  
  async createReferral({
    recipientAddress,
    businessName,
    tier,
    discountPercent,
    validDays = 7
  }) {
    const fullPrice = this.tierPrices[tier];
    const discount = Math.floor((fullPrice * discountPercent) / 100);
    const discountedPrice = fullPrice - discount;
    
    const referral = {
      recipient: recipientAddress,
      tier: tier,
      discountedPrice: discountedPrice,
      businessName: businessName,
      nonce: Date.now(),
      deadline: Math.floor(Date.now() / 1000) + (validDays * 24 * 60 * 60)
    };
    
    const signature = await this.signer.signTypedData(
      this.domain,
      this.types,
      referral
    );
    
    return {
      referral,
      signature,
      fullPrice: fullPrice / 1_000_000,
      discountedPrice: discountedPrice / 1_000_000,
      savings: discount / 1_000_000,
      discountPercent,
      expiresAt: new Date(referral.deadline * 1000).toISOString()
    };
  }
}

// Usage (Backend)
const referralService = new ReferralService(process.env.REFERRAL_SIGNER_KEY);

// API endpoint: POST /api/referrals
app.post("/api/referrals", async (req, res) => {
  const { recipientAddress, businessName, tier, discountPercent } = req.body;
  
  const referral = await referralService.createReferral({
    recipientAddress,
    businessName,
    tier,
    discountPercent,
    validDays: 7
  });
  
  res.json(referral);
});
```

### Attestor Service

```javascript
class AttestorService {
  constructor(attestorSigner) {
    this.bizfi = new ethers.Contract(BIZFI_PROXY, BIZFI_ABI, attestorSigner);
  }
  
  async createAttestation(businessId, attestationType, verificationData, recipientAddress, expirationDays = 0) {
    // Hash the verification data
    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(verificationData))
    );
    
    // Calculate expiration
    const expirationTime = expirationDays > 0
      ? Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60)
      : 0;
    
    const tx = await this.bizfi.createAttestation(
      businessId,
      attestationType,
      dataHash,
      recipientAddress,
      expirationTime
    );
    
    const receipt = await tx.wait();
    
    // Parse event
    const iface = new ethers.Interface(BIZFI_ABI);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed.name === "AttestationCreated") {
          return {
            attestationId: Number(parsed.args.attestationId),
            easUid: parsed.args.easUid,
            businessId: Number(parsed.args.businessId),
            attestationType: parsed.args.attestationType,
            transactionHash: receipt.hash
          };
        }
      } catch {}
    }
  }
  
  async revokeAttestation(attestationId) {
    const tx = await this.bizfi.revokeAttestation(attestationId);
    await tx.wait();
    return { revoked: true, attestationId };
  }
}

// Usage
const attestorWallet = new ethers.Wallet(process.env.ATTESTOR_KEY, provider);
const attestorService = new AttestorService(attestorWallet);

// Create KYC attestation
const result = await attestorService.createAttestation(
  1, // businessId
  3, // KYC_KYB
  { provider: "SumSub", status: "verified", date: "2024-12-01" },
  "0xBusinessOwner...",
  365 // expires in 1 year
);
```

### React Hook Example

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getContract } from 'viem';

export function useBizFi() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const bizfi = getContract({
    address: BIZFI_PROXY,
    abi: BIZFI_ABI,
    client: { public: publicClient, wallet: walletClient }
  });
  
  // Fetch user's businesses
  const fetchBusinesses = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await bizfi.read.getBusinessesByOwner([address]);
      setBusinesses(result.map(b => ({
        id: Number(b.id),
        name: b.name,
        tier: Number(b.tier),
        status: Number(b.status)
      })));
    } finally {
      setLoading(false);
    }
  }, [address, bizfi]);
  
  // Register business
  const register = useCallback(async (name, metadata, tier) => {
    const metadataHash = keccak256(toBytes(JSON.stringify(metadata)));
    const emptyReferral = { recipient: zeroAddress, tier: 0, discountedPrice: 0n, businessName: '', nonce: 0n, deadline: 0n };
    
    const hash = await bizfi.write.registerBusiness([name, metadataHash, tier, emptyReferral, '0x']);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    await fetchBusinesses();
    return receipt;
  }, [bizfi, publicClient, fetchBusinesses]);
  
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);
  
  return { businesses, loading, register, refresh: fetchBusinesses };
}
```

---

## Security Considerations

### Smart Contract Security

1. **UUPS Upgradeable**: Contract can be upgraded by the owner. Upgrades require careful review.

2. **Access Control**: 
   - `ADMIN_ROLE`: Can modify contract settings, fees, and statuses
   - `ATTESTOR_ROLE`: Can create and revoke attestations
   - Always verify role holders are trusted parties

3. **Pausable**: Contract can be paused in emergencies by admins.

4. **ReentrancyGuard**: Protected against reentrancy attacks.

### Referral System Security

1. **Private Keys**: Never expose the `referralSigner` private key. Keep it secure on your backend only.

2. **Nonce Management**: 
   - Each nonce can only be used once
   - Use timestamps or UUIDs for uniqueness
   - Store issued nonces in your database to avoid collisions

3. **Deadline**: Always set reasonable deadlines (7-30 days) to limit exposure if referral data leaks.

4. **Amount Validation**: The contract ensures `discountedPrice <= fullPrice` - you can't create "negative discount" referrals.

### Frontend Security

1. **USDC Approvals**: Only approve the exact amount needed, not unlimited approvals.

2. **Metadata Verification**: Always verify metadata hash matches expected content before displaying.

3. **Event Verification**: When reading events, verify they came from the correct contract address.

### Attestation Trust

1. **Attestor Verification**: Only trust attestations from known, verified attestors.

2. **Revocation Check**: Always check `isRevoked` before trusting an attestation.

3. **Expiration**: Check attestation expiration time on EAS for time-sensitive verifications.

4. **Data Integrity**: The `dataHash` proves what data was attested, but you need off-chain data to verify it.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Insufficient allowance" | USDC not approved | Call `usdc.approve(BIZFI_PROXY, amount)` |
| "Invalid referral signature" | Wrong signer or malformed data | Verify EIP-712 domain and types match exactly |
| "Referral expired" | Deadline passed | Request new referral |
| "Business not found" | Wrong ID or not registered | Verify business ID exists |
| "Not business owner" | Wrong wallet | Switch to owner wallet |
| Transaction reverts silently | Gas estimation failed | Try with explicit gas limit |

### Debugging Tips

```javascript
// Check if business exists
const total = await bizfi.getTotalBusinesses();
console.log(`Total businesses: ${total}`);

// Check ownership
const owns = await bizfi.ownsBusinessId(address, businessId);
console.log(`Owns business: ${owns}`);

// Check USDC allowance
const allowance = await usdc.allowance(address, BIZFI_PROXY);
console.log(`USDC allowance: ${Number(allowance) / 1e6}`);

// Check USDC balance
const balance = await usdc.balanceOf(address);
console.log(`USDC balance: ${Number(balance) / 1e6}`);

// Verify referral signer
const signer = await bizfi.referralSigner();
console.log(`Referral signer: ${signer}`);

// Check nonce usage
const used = await bizfi.isReferralNonceUsed(nonce);
console.log(`Nonce used: ${used}`);
```

---

## Support

- **GitHub**: https://github.com/CryptoSmartNow/bizfi
- **Basescan**: [View Contract](https://basescan.org/address/0x7C24A938e086d01d252f1cde36783c105784c770)
- **EAS Schema**: [View Schema](https://base.easscan.org/schema/view/0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404)

---

## Changelog

### v1.0.0 (December 2025)
- Initial deployment on Base mainnet
- Business registration with USDC listing fees
- EIP-712 signed referral discounts
- EAS attestation integration
- Multi-business support per address

---

*Last updated: December 2025*
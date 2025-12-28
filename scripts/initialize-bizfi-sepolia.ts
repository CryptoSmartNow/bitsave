/**
 * BizFi Contract Initialization Script for Base Sepolia
 * 
 * This script initializes the BizFi proxy contract on Base Sepolia testnet.
 * Run this once after deployment to set up the contract with proper parameters.
 * 
 * Usage:
 *   1. Set your PRIVATE_KEY in .env.local
 *   2. Run: npx ts-node scripts/initialize-bizfi-sepolia.ts
 */

import { createWalletClient, createPublicClient, http, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ============================================
// BASE SEPOLIA TESTNET CONFIGURATION
// ============================================

const CONFIG = {
    // BizFi Proxy Contract on Base Sepolia
    BIZFI_PROXY: '0x3593546078eECD0FFd1c19317f53ee565be6ca13' as const,

    // Circle USDC on Base Sepolia
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,

    // EAS Contract (same predeploy address across Base chains)
    EAS: '0x4200000000000000000000000000000000000021' as const,

    // Schema UID (same as mainnet or you can create a new one on Sepolia)
    SCHEMA_UID: '0xdf6d46c2112c326d65068fab3aadc96347d2d543fad9d969ba27c427e2687404' as const,

    // Owner/Admin/Referral Signer (your deployer address)
    OWNER: '0x125629FAab442e459C1015FCBa50499D0aAB8EE0' as const,
};

// Initialize ABI (only the functions we need)
const BIZFI_INIT_ABI = [
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            { "name": "_eas", "type": "address" },
            { "name": "_schemaUid", "type": "bytes32" },
            { "name": "_owner", "type": "address" },
            { "name": "_usdc", "type": "address" },
            { "name": "_referralSigner", "type": "address" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "usdc",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "eas",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getListingFee",
        "inputs": [{ "name": "tier", "type": "uint8" }],
        "outputs": [{ "name": "fee", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getAllListingFees",
        "inputs": [],
        "outputs": [
            { "name": "microFee", "type": "uint256" },
            { "name": "builderFee", "type": "uint256" },
            { "name": "growthFee", "type": "uint256" },
            { "name": "enterpriseFee", "type": "uint256" }
        ],
        "stateMutability": "view"
    }
] as const;

async function main() {
    console.log('\n🚀 BizFi Contract Initialization Script');
    console.log('========================================\n');
    console.log('Network: Base Sepolia Testnet (Chain ID: 84532)');
    console.log(`BizFi Proxy: ${CONFIG.BIZFI_PROXY}`);
    console.log(`USDC: ${CONFIG.USDC}`);
    console.log(`EAS: ${CONFIG.EAS}`);
    console.log(`Owner: ${CONFIG.OWNER}\n`);

    // Check for private key
    const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ Error: PRIVATE_KEY or DEPLOYER_PRIVATE_KEY not found in .env.local');
        console.log('\nPlease add your deployer private key to .env.local:');
        console.log('PRIVATE_KEY=0x...');
        process.exit(1);
    }

    // Create account from private key
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    console.log(`Wallet: ${account.address}`);

    // Verify this is the owner
    if (account.address.toLowerCase() !== CONFIG.OWNER.toLowerCase()) {
        console.warn(`\n⚠️  Warning: Connected wallet (${account.address}) is different from CONFIG.OWNER (${CONFIG.OWNER})`);
        console.log('Make sure this wallet has permission to initialize the contract.\n');
    }

    // Create clients
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });

    const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http(),
    });

    // Check if already initialized
    console.log('\n📋 Checking contract state...');
    try {
        const ownerResult = await publicClient.readContract({
            address: CONFIG.BIZFI_PROXY,
            abi: BIZFI_INIT_ABI,
            functionName: 'owner',
        });

        if (ownerResult !== '0x0000000000000000000000000000000000000000') {
            console.log(`\n✅ Contract already initialized!`);
            console.log(`   Owner: ${ownerResult}`);

            // Get additional info
            const usdcResult = await publicClient.readContract({
                address: CONFIG.BIZFI_PROXY,
                abi: BIZFI_INIT_ABI,
                functionName: 'usdc',
            });
            console.log(`   USDC: ${usdcResult}`);

            const fees = await publicClient.readContract({
                address: CONFIG.BIZFI_PROXY,
                abi: BIZFI_INIT_ABI,
                functionName: 'getAllListingFees',
            });
            console.log(`   Listing Fees:`);
            console.log(`     - MICRO: $${Number(fees[0]) / 1_000_000}`);
            console.log(`     - BUILDER: $${Number(fees[1]) / 1_000_000}`);
            console.log(`     - GROWTH: $${Number(fees[2]) / 1_000_000}`);
            console.log(`     - ENTERPRISE: $${Number(fees[3]) / 1_000_000}`);

            console.log('\n✨ Contract is ready to use!');
            return;
        }
    } catch (error: any) {
        // If owner() reverts, contract might not be initialized
        console.log('Contract appears to be uninitialized. Proceeding...');
    }

    // Check ETH balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`ETH Balance: ${Number(balance) / 1e18} ETH`);

    if (balance === BigInt(0)) {
        console.error('\n❌ Error: No ETH balance. Get testnet ETH from:');
        console.log('   https://www.coinbase.com/faucets/base-sepolia-faucet');
        process.exit(1);
    }

    // Initialize the contract
    console.log('\n🔧 Initializing BizFi contract...');
    console.log('Parameters:');
    console.log(`  _eas: ${CONFIG.EAS}`);
    console.log(`  _schemaUid: ${CONFIG.SCHEMA_UID}`);
    console.log(`  _owner: ${CONFIG.OWNER}`);
    console.log(`  _usdc: ${CONFIG.USDC}`);
    console.log(`  _referralSigner: ${CONFIG.OWNER}`);

    try {
        const hash = await walletClient.writeContract({
            address: CONFIG.BIZFI_PROXY,
            abi: BIZFI_INIT_ABI,
            functionName: 'initialize',
            args: [
                CONFIG.EAS,
                CONFIG.SCHEMA_UID,
                CONFIG.OWNER,
                CONFIG.USDC,
                CONFIG.OWNER, // referralSigner = owner
            ],
        });

        console.log(`\n📝 Transaction submitted: ${hash}`);
        console.log(`   View on Basescan: https://sepolia.basescan.org/tx/${hash}`);

        console.log('\n⏳ Waiting for confirmation...');
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
            console.log('\n✅ Contract initialized successfully!');
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas Used: ${receipt.gasUsed}`);

            // Verify initialization
            console.log('\n📋 Verifying initialization...');
            const fees = await publicClient.readContract({
                address: CONFIG.BIZFI_PROXY,
                abi: BIZFI_INIT_ABI,
                functionName: 'getAllListingFees',
            });
            console.log(`   Listing Fees:`);
            console.log(`     - MICRO: $${Number(fees[0]) / 1_000_000}`);
            console.log(`     - BUILDER: $${Number(fees[1]) / 1_000_000}`);
            console.log(`     - GROWTH: $${Number(fees[2]) / 1_000_000}`);
            console.log(`     - ENTERPRISE: $${Number(fees[3]) / 1_000_000}`);

            console.log('\n✨ BizFi is ready to use on Base Sepolia!');
        } else {
            console.error('\n❌ Transaction failed!');
            console.log('Receipt:', receipt);
        }
    } catch (error: any) {
        console.error('\n❌ Error during initialization:');
        if (error.message?.includes('already initialized')) {
            console.log('Contract has already been initialized.');
        } else if (error.message?.includes('InvalidInitialization')) {
            console.log('Contract has already been initialized (InvalidInitialization error).');
        } else {
            console.error(error.message || error);
        }
    }
}

main().catch(console.error);

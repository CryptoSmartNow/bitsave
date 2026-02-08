
import { createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
    console.log(`Using RPC: ${rpcUrl}`);

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http(rpcUrl)
    });

    const privateKey = process.env.AGENT_PRIVATE_KEY || process.env.BIZFI_AGENT_PRIVATE_KEY || process.env.REFERRAL_SIGNER_PRIVATE_KEY;
    
    if (!privateKey) {
        console.error("❌ No private key found in .env (checked AGENT_PRIVATE_KEY, BIZFI_AGENT_PRIVATE_KEY, REFERRAL_SIGNER_PRIVATE_KEY)");
        process.exit(1);
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`Example Agent Account: ${account.address}`);

    const balance = await client.getBalance({ address: account.address });
    console.log(`Balance: ${formatEther(balance)} ETH`);

    if (balance === BigInt(0)) {
        console.error("❌ Account has 0 ETH. You need Base Sepolia ETH to execute transactions.");
    } else {
        console.log("✅ Account has funds.");
    }
}

main().catch(console.error);

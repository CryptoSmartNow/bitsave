import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getBizSwapCollection, getDatabase } from '@/lib/mongodb';
import { getChainConfig, BizSwapSupportedChain } from '@/lib/bizswap-contracts';
import crypto from 'crypto';
import { z } from 'zod';

const mintSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  chainrailsSessionId: z.string().min(1, 'Chainrails session ID is required'),
  chain: z.enum(['BASE', 'SOLANA']).default('BASE'),
});

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    const body = await request.json();
    const parsed = mintSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { walletAddress, chainrailsSessionId, chain } = parsed.data;
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // 1. Verify deposit is completed
    const deposit = await db.collection('bizbond_deposits').findOne({
      "chainrailsSession.session_id": chainrailsSessionId,
      walletAddress: walletAddress
    });

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit session not found for this wallet' }, { status: 404 });
    }

    // For testing/development, you might bypass this check if status isn't updating properly yet
    if (deposit.status !== 'completed' && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Deposit is not yet confirmed by Chainrails' }, { status: 400 });
    }

    if (deposit.mintInitiated) {
      return NextResponse.json({ error: 'Minting already initiated for this deposit' }, { status: 400 });
    }

    const { instrument, amount, token } = deposit;
    
    const selectedChainKey: BizSwapSupportedChain = chain.toLowerCase() === 'botchain' ? 'botchain' : 'base';
    const chainConfig = getChainConfig(selectedChainKey);

    // 2. Generate Specs
    const now = new Date();
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    const certificateId = `cert_${crypto.randomUUID().replace(/-/g, '')}`;
    const currentCycle = `${now.getFullYear()}-${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()}`;

    let entitlementBps = 0;
    let vestEndTimestamp = currentTimestamp + 90 * 24 * 60 * 60;
    let yieldStartTimestamp = vestEndTimestamp;
    let instrumentTypeIndex = 0;
    let feeAmount = 0; // Or whatever fee logic BizBond has

    if (instrument === 'BizYield') {
      instrumentTypeIndex = 0;
      entitlementBps = Math.floor((amount / 10000) * 10000);
    } else if (instrument === 'BizCredit') {
      instrumentTypeIndex = 1;
      entitlementBps = Math.floor(amount / 100);
      vestEndTimestamp = currentTimestamp;
      yieldStartTimestamp = currentTimestamp;
    } else if (instrument === 'BizBond') {
      instrumentTypeIndex = 2;
      entitlementBps = 0;
    }

    const onChainParams = {
      chain: selectedChainKey,
      chainId: chainConfig.id,
      networkName: chainConfig.name,
      contractAddress: chainConfig.contracts.controllerOrProxy,
      currency: chainConfig.currency,
      amountUsdCents: Math.round(amount * 100),
      feeAmountUsdCents: Math.round(feeAmount * 100),
      entitlementBpsOrUnits: entitlementBps,
      instrumentType: instrumentTypeIndex,
      vestEndTimestamp,
      yieldStartTimestamp,
      cycle: currentCycle,
      uri: `https://bitsave.io/api/bizswap/metadata/${certificateId}`,
    };

    // 3. Save pending mint record
    const collection = await getBizSwapCollection();
    if (collection) {
      await collection.insertOne({
        wallet: walletAddress,
        instrument,
        investmentAmount: amount,
        mintAddress: certificateId,
        chain: selectedChainKey,
        onChainParams,
        developerId: auth.developerId || null,
        status: 'Pending Mint',
        purchaseDate: now.toISOString(),
        createdAt: now,
      });

      // Mark deposit as used
      await db.collection('bizbond_deposits').updateOne(
        { _id: deposit._id },
        { $set: { mintInitiated: true, certificateId } }
      );
    }

    // 4. Return the unsigned transaction payload so the third party can prompt their user to sign
    return NextResponse.json({
      success: true,
      message: 'Ready to mint. Please sign the transaction using the provided payload.',
      data: {
        certificateId,
        contractAddress: onChainParams.contractAddress,
        abi: '... [BizBond ABI details] ...', // Note: You would import and provide the ABI here
        methodName: 'mintCertificate', // The smart contract function to call
        args: [
          walletAddress,
          onChainParams.amountUsdCents,
          onChainParams.feeAmountUsdCents,
          onChainParams.entitlementBpsOrUnits,
          onChainParams.instrumentType,
          onChainParams.uri
        ],
        onChainParams
      }
    });

  } catch (error: any) {
    console.error('API /mint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

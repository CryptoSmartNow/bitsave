import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';
import crypto from 'crypto';
import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddressSync 
} from '@solana/spl-token';
import { 
  BIZSWAP_PROGRAM_ID, 
  getGlobalConfigPda, 
  getInstrumentConfigPda, 
  getCertificateRecordPda 
} from '@/lib/bizswap-solana';
import idl from '@/idl/bizswap_solana.json';
import { BizswapSolana } from '@/types/bizswap_solana';

const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export async function POST(req: NextRequest) {
  try {
    const { wallet, instrument, investmentAmount, feeAmount, totalCharged } = await req.json();

    if (!wallet || !instrument || !investmentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Connect to Solana
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    
    // IMPORTANT: The backend needs the mint_authority private key to sign the mint transaction.
    // This key must match the mint_authority set in the GlobalConfig PDA on-chain.
    const secretStr = process.env.MINT_AUTHORITY_SECRET;
    if (!secretStr) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing MINT_AUTHORITY_SECRET' }, { status: 500 });
    }
    const mintAuthority = Keypair.fromSecretKey(bs58.decode(secretStr));

    const dummyWallet = {
      publicKey: mintAuthority.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(mintAuthority);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        return txs.map((tx: any) => {
          tx.partialSign(mintAuthority);
          return tx;
        });
      }
    };
    const provider = new anchor.AnchorProvider(connection, dummyWallet as any, { preflightCommitment: "confirmed" });
    const program = new anchor.Program(idl as anchor.Idl, provider) as unknown as anchor.Program<BizswapSolana>;

    const ownerPubkey = new PublicKey(wallet);
    const mintKeypair = Keypair.generate();

    const globalConfigPda = getGlobalConfigPda();
    const certificateRecordPda = getCertificateRecordPda(mintKeypair.publicKey);
    
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
      METAPLEX_PROGRAM_ID
    );

    const userAta = getAssociatedTokenAddressSync(mintKeypair.publicKey, ownerPubkey);

    // Determine Certificate Specs
    let instrumentTypeId = 0;
    let entitlementBps = 0;
    let vestEndTs = 0;
    let yieldStartTs = 0;
    let metadataName = "";
    let metadataSymbol = "";
    let metadataUri = "";

    let entitlement = '';
    let status = 'Active';
    let nextPayment = '';
    let apr = '';
    let payoutFrequency = '';
    const now = new Date();
    const nowTs = Math.floor(now.getTime() / 1000);

    const serialNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const cycleBuffer = Array.from(Buffer.from("2026-MAY".padEnd(8, " "), "utf-8"));

    if (instrument === 'BizYield') {
      instrumentTypeId = 0;
      entitlementBps = Math.floor((investmentAmount / 10000) * 100 * 100); // converting % to bps
      vestEndTs = Math.floor(new Date('2026-08-01T00:00:00Z').getTime() / 1000);
      yieldStartTs = vestEndTs;
      metadataName = `BizYield #${serialNumber}`;
      metadataSymbol = "BYZLD";
      metadataUri = "https://assets.bizmarket.io/certs/1.json";

      const percentage = (investmentAmount / 10000) * 100;
      entitlement = `${percentage.toFixed(2)}% rev share`;
      status = 'Vesting — Aug 1';
      nextPayment = '2026-08-01T00:00:00Z';
      apr = 'Variable';
      payoutFrequency = 'Monthly';
    } else if (instrument === 'BizCredit') {
      instrumentTypeId = 1;
      entitlementBps = 1600; // 16% annualized
      vestEndTs = nowTs - 100; // Past, so it's instantly active
      yieldStartTs = nowTs;
      metadataName = `BizCredit #${serialNumber}`;
      metadataSymbol = "BZCRD";
      metadataUri = "https://assets.bizmarket.io/certs/2.json";

      const units = Math.floor(investmentAmount / 100);
      const weeklyPayout = units * 8.67;
      entitlement = `$${weeklyPayout.toFixed(2)} / week`;
      status = 'Active';
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      nextPayment = nextWeek.toISOString();
      apr = '16% Annualised';
      payoutFrequency = 'Weekly';
    } else if (instrument === 'BizBond') {
      instrumentTypeId = 2;
      entitlementBps = 1000; // 10% fixed
      vestEndTs = Math.floor(new Date('2026-08-01T00:00:00Z').getTime() / 1000);
      yieldStartTs = vestEndTs;
      metadataName = `BizBond #${serialNumber}`;
      metadataSymbol = "BZBND";
      metadataUri = "https://assets.bizmarket.io/certs/3.json";

      const annualYield = investmentAmount * 0.10;
      const quarterlyPayout = annualYield / 4;
      entitlement = `$${quarterlyPayout.toFixed(2)} / quarter`;
      status = 'Vesting — Aug 1';
      nextPayment = '2026-08-01T00:00:00Z';
      apr = '10% Fixed';
      payoutFrequency = 'Quarterly';
    } else {
      return NextResponse.json({ error: 'Invalid instrument type' }, { status: 400 });
    }

    const instrumentConfigPda = getInstrumentConfigPda(instrumentTypeId);

    // Call Solana Smart Contract
    const txSig = await program.methods
      .mintCertificate(
        instrumentTypeId,
        new anchor.BN(investmentAmount * 100), // convert to cents
        new anchor.BN(entitlementBps),
        new anchor.BN(vestEndTs),
        new anchor.BN(yieldStartTs),
        cycleBuffer,
        metadataName,
        metadataSymbol,
        metadataUri
      )
      .accounts({
        mintAuthority: mintAuthority.publicKey,
        // @ts-ignore
        globalConfig: globalConfigPda,
        instrumentConfig: instrumentConfigPda,
        owner: ownerPubkey,
        certificateRecord: certificateRecordPda,
        mint: mintKeypair.publicKey,
        tokenAccount: userAta,
        metadataAccount: metadataPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        metadataProgram: METAPLEX_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintAuthority, mintKeypair])
      .rpc();

    // Store in Database
    const purchaseRecord = {
      wallet,
      instrument,
      investmentAmount,
      feeAmount,
      totalCharged,
      entitlement,
      status,
      nextPayment,
      mintAddress: mintKeypair.publicKey.toBase58(),
      serialNumber,
      apr,
      payoutFrequency,
      purchaseDate: now.toISOString(),
      createdAt: now,
      transactionSignature: txSig
    };

    await collection.insertOne(purchaseRecord);

    return NextResponse.json({
      success: true,
      message: 'Certificate minted successfully on-chain',
      data: purchaseRecord
    });

  } catch (error: any) {
    console.error('Minting error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { getBizSwapCollection, getBizSwapUsersCollection } from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { BIZSWAP_CHAINS, BizSwapSupportedChain, getChainConfig, getExplorerUrl } from '@/lib/bizswap-contracts';

export async function handleMint(data: any) {
  const {
    wallet,
    instrument,
    investmentAmount,
    feeAmount,
    totalCharged,
    bizswapReferralCode,
    email,
    business,
    chain = 'base',
  } = data;

  if (!wallet || !instrument || !investmentAmount) {
    throw new Error('Missing required fields');
  }

  const collection = await getBizSwapCollection();
  if (!collection) {
    throw new Error('Database unavailable');
  }

  const selectedChainKey: BizSwapSupportedChain = chain === 'botchain' ? 'botchain' : 'base';
  const chainConfig = getChainConfig(selectedChainKey);

  // Determine Certificate Specs & Timelines
  let entitlement = '';
  let entitlementBps = 0;
  let status = 'Active';
  let nextPayment = '';
  let apr = '';
  let payoutFrequency = '';
  const now = data.originalPurchaseDate ? new Date(data.originalPurchaseDate) : new Date();
  const currentTimestamp = Math.floor(now.getTime() / 1000);

  const serialNumber = Math.floor(1000 + Math.random() * 9000).toString();
  const currentCycle = '2026-MAY';

  let vestEndTimestamp = currentTimestamp + 90 * 24 * 60 * 60; // 90 days vesting default
  let yieldStartTimestamp = vestEndTimestamp;
  let instrumentTypeIndex = 0;

  if (instrument === 'BizYield') {
    instrumentTypeIndex = 0;
    const percentage = (investmentAmount / 10000) * 100;
    entitlementBps = Math.floor((investmentAmount / 10000) * 10000); // 100 bps per 1%
    entitlement = `${percentage.toFixed(2)}% rev share`;
    const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
    nextPayment = vestEnd.toISOString();
    apr = 'Variable (Rev Share)';
    payoutFrequency = 'Monthly';
  } else if (instrument === 'BizCredit') {
    instrumentTypeIndex = 1;
    const units = Math.floor(investmentAmount / 100);
    entitlementBps = units; // For BizCredit, entitlement represents whole units
    const weeklyPayout = units * 8.67;
    entitlement = `$${weeklyPayout.toFixed(2)} / week`;
    status = 'Active';
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    nextPayment = nextWeek.toISOString();
    apr = '16% Annualised';
    payoutFrequency = 'Weekly';
    vestEndTimestamp = currentTimestamp;
    yieldStartTimestamp = currentTimestamp;
  } else if (instrument === 'BizBond') {
    instrumentTypeIndex = 2;
    entitlementBps = 0; // Fixed rate 10%
    const annualYield = investmentAmount * 0.10;
    const quarterlyPayout = annualYield / 4;
    entitlement = `$${quarterlyPayout.toFixed(2)} / quarter`;
    const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
    nextPayment = vestEnd.toISOString();
    apr = '10% Fixed';
    payoutFrequency = 'Quarterly';
  } else {
    throw new Error('Invalid instrument type');
  }

  // Generate unique certificate identifier & mock on-chain tx
  const certificateId = `cert_${crypto.randomUUID().replace(/-/g, '')}`;
  const transactionId = `0x${crypto.randomBytes(32).toString('hex')}`;

  // On-chain parameters for Base and Botchain contracts
  const onChainParams = {
    chain: selectedChainKey,
    chainId: chainConfig.id,
    networkName: chainConfig.name,
    contractAddress: chainConfig.contracts.controllerOrProxy,
    currency: chainConfig.currency,
    // Base params
    amountUsdCents: Math.round(investmentAmount * 100),
    feeAmountUsdCents: Math.round(feeAmount * 100),
    entitlementBpsOrUnits: entitlementBps,
    instrumentType: instrumentTypeIndex,
    // Botchain params
    vestEndTimestamp,
    yieldStartTimestamp,
    cycle: currentCycle,
    uri: `https://bitsave.io/api/bizswap/metadata/${certificateId}`,
  };

  const explorerTxUrl = getExplorerUrl(selectedChainKey, transactionId, 'tx');

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
    mintAddress: certificateId,
    serialNumber,
    apr,
    payoutFrequency,
    chain: selectedChainKey,
    chainId: chainConfig.id,
    networkName: chainConfig.name,
    currency: chainConfig.currency,
    contractAddress: chainConfig.contracts.controllerOrProxy,
    explorerUrl: explorerTxUrl,
    onChainParams,
    business: business || null,
    purchaseDate: now.toISOString(),
    createdAt: now,
    reference: data.reference || null,
    transactionSignature: transactionId,
    referredByCode: bizswapReferralCode || null,
  };

  await collection.insertOne(purchaseRecord);

  // Process Referral Reward (0.1% reward)
  if (bizswapReferralCode) {
    const usersCollection = await getBizSwapUsersCollection();
    if (usersCollection) {
      const rewardAmount = investmentAmount * 0.001;
      await usersCollection.updateOne(
        { bizswapReferralCode: bizswapReferralCode.toUpperCase() },
        { $inc: { bizswapPendingUsdcEarnings: rewardAmount, bizswapTotalUsdcEarned: rewardAmount } }
      );
    }
  }

  // Send Confirmation Email
  if (email && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.privateemail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const assetName = business || (instrument === 'BizYield' ? 'Revenue Share Pool' : instrument === 'BizCredit' ? 'Private Credit Pool' : 'Treasury Backed Pool');
      const networkBadgeColor = selectedChainKey === 'base' ? '#0052FF' : '#10B981';

      const htmlContent = `
<div style="background-color: #070A0F; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F9F9FB;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d131f; border-radius: 20px; border: 1px solid #1c2538; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
    <!-- Top Accent Bar -->
    <div style="height: 6px; background: linear-gradient(90deg, #34d399 0%, #81D7B4 50%, #3B82F6 100%); width: 100%;"></div>
    
    <div style="padding: 40px;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RWA Yield Certificate Issued 📑</h2>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #a1b0c0; margin: 0 0 28px 0;">
        Congratulations! Your <strong>${instrument}</strong> certificate has been successfully minted on <strong>${chainConfig.name}</strong>. 🎉
      </p>
      
      <!-- Main Receipt Card -->
      <div style="background-color: #121A27; border: 1px solid #1C2538; border-radius: 16px; padding: 28px; margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <span style="background-color: rgba(129, 215, 180, 0.12); color: #81D7B4; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            🟢 Mint Confirmed
          </span>
          <span style="background-color: rgba(255,255,255,0.06); color: #F9F9FB; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            🌐 ${chainConfig.name}
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Network</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 14px; text-align: right;">${chainConfig.name} (Chain ${chainConfig.id})</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Instrument</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 14px; text-align: right;">${instrument}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Asset Pool</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 14px; text-align: right;">${assetName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Investment</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #81D7B4; font-weight: 700; font-size: 15px; text-align: right;">$${investmentAmount.toLocaleString()} ${chainConfig.currency}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Payout Schedule</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 14px; text-align: right;">${payoutFrequency}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #7B8B9A; font-size: 14px;">Target Yield</td>
            <td style="padding: 10px 0; color: #F9F9FB; font-weight: 600; font-size: 14px; text-align: right;">${apr}</td>
          </tr>
        </table>
      </div>

      <!-- Tx Hash Section -->
      <div style="background-color: rgba(28, 37, 56, 0.4); border-left: 3px solid #81D7B4; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #7B8B9A; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🔗 Certificate ID / Hash</p>
        <p style="color: #81D7B4; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; word-break: break-all;">
          ${certificateId}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="https://bitsave.io/bizswap/app/certificates" style="display: inline-block; background-color: #81D7B4; color: #070A0F; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 14px rgba(129, 215, 180, 0.3);">
          👉 View Certificate in Dashboard
        </a>
      </div>

      <hr style="border: 0; border-top: 1px dashed #1C2538; margin: 0 0 32px 0;" />

      <!-- Footer -->
      <p style="font-size: 13px; line-height: 1.6; color: #7B8B9A; margin: 0 0 8px 0;">
        Bitsave Protocol &middot; RWA Yield Platform
      </p>
      <p style="font-size: 12px; color: #4b5563; margin: 0;">
        &copy; 2026 Bitsave Protocol. All rights reserved.
      </p>
    </div>
  </div>
</div>
      `;

      await transporter.sendMail({
        from: `"Bitsave Protocol" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `RWA Yield Secured on ${chainConfig.name} — ${instrument} 📑`,
        html: htmlContent,
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  }

  return purchaseRecord;
}

import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection, getBizSwapUsersCollection } from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { wallet, instrument, investmentAmount, feeAmount, totalCharged, bizswapReferralCode, email, business } = await req.json();

    if (!wallet || !instrument || !investmentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Determine Certificate Specs
    let entitlement = '';
    let status = 'Active';
    let nextPayment = '';
    let apr = '';
    let payoutFrequency = '';
    const now = new Date();

    const serialNumber = Math.floor(1000 + Math.random() * 9000).toString();

    if (instrument === 'BizYield') {
      const percentage = (investmentAmount / 10000) * 100;
      entitlement = `${percentage.toFixed(2)}% rev share`;
      const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
      nextPayment = vestEnd.toISOString();
      apr = 'Variable';
      payoutFrequency = 'Monthly';
    } else if (instrument === 'BizCredit') {
      const units = Math.floor(investmentAmount / 100);
      const weeklyPayout = units * 8.67;
      entitlement = `$${weeklyPayout.toFixed(2)} / week`;
      status = 'Active';
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      nextPayment = nextWeek.toISOString();
      apr = '16% Annualised';
      payoutFrequency = 'Weekly';
    } else if (instrument === 'BizBond') {
      const annualYield = investmentAmount * 0.10;
      const quarterlyPayout = annualYield / 4;
      entitlement = `$${quarterlyPayout.toFixed(2)} / quarter`;
      const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
      nextPayment = vestEnd.toISOString();
      apr = '10% Fixed';
      payoutFrequency = 'Quarterly';
    } else {
      return NextResponse.json({ error: 'Invalid instrument type' }, { status: 400 });
    }

    // Off-chain certificate identifiers
    const certificateId = `cert_${crypto.randomUUID().replace(/-/g, '')}`;
    const transactionId = `tx_${crypto.randomUUID().replace(/-/g, '')}`;

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
      mintAddress: certificateId, // Storing as mintAddress so frontend dashboard doesn't break
      serialNumber,
      apr,
      payoutFrequency,
      purchaseDate: now.toISOString(),
      createdAt: now,
      transactionSignature: transactionId, // Storing as txSig so frontend dashboard doesn't break
      referredByCode: bizswapReferralCode || null,
    };

    await collection.insertOne(purchaseRecord);

    // Process Referral Reward
    if (bizswapReferralCode) {
      const usersCollection = await getBizSwapUsersCollection();
      if (usersCollection) {
        const rewardAmount = investmentAmount * 0.001; // 0.1% of investment
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

    const htmlContent = `
<div style="background-color: #070A0F; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F9F9FB;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d131f; border-radius: 20px; border: 1px solid #1c2538; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
    
    <!-- Top Accent Bar -->
    <div style="height: 6px; background: linear-gradient(90deg, #34d399 0%, #81D7B4 100%); width: 100%;"></div>
    
    <div style="padding: 40px;">
      
      <!-- Header -->
      <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RWA Yield Secured with BizShares 📑</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1b0c0; margin: 0 0 32px 0;">
        Big congrats — you just bought your BizShare on BizSwap. 🎉<br/><br/>
        Here's what happened:
      </p>
      
      <!-- Main Receipt Card -->
      <div style="background-color: #121A27; border: 1px solid #1C2538; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
        
        <div style="margin-bottom: 24px;">
          <span style="background-color: rgba(129, 215, 180, 0.1); color: #81D7B4; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            🟢 Purchase Confirmed
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Instrument</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 15px; text-align: right;">${instrument}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Asset</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 15px; text-align: right;">${assetName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Amount</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #81D7B4; font-weight: 700; font-size: 15px; text-align: right;">$${investmentAmount.toLocaleString()} USDC</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #7B8B9A; font-size: 14px;">Payout schedule</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #F9F9FB; font-weight: 600; font-size: 15px; text-align: right;">${payoutFrequency}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #7B8B9A; font-size: 14px;">Target yield</td>
            <td style="padding: 12px 0; color: #F9F9FB; font-weight: 600; font-size: 15px; text-align: right;">${apr}</td>
          </tr>
        </table>
      </div>

      <!-- Tx Hash Section -->
      <div style="background-color: rgba(28, 37, 56, 0.4); border-left: 3px solid #81D7B4; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #7B8B9A; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🔗 Certificate ID</p>
        <p style="color: #81D7B4; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; word-break: break-all;">
          ${certificateId}
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #a1b0c0; margin: 0 0 32px 0;">
        Your BizShare is now live in your dashboard. That's where you'll track your payouts, see your yield accumulate, and manage your position whenever you want.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="https://bitsave.io/bizswap/dashboard" style="display: inline-block; background-color: #81D7B4; color: #070A0F; padding: 16px 32px; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 14px rgba(129, 215, 180, 0.3);">
          👉 Go to your dashboard
        </a>
      </div>

      <hr style="border: 0; border-top: 1px dashed #1C2538; margin: 0 0 40px 0;" />

      <!-- Reminder -->
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff;">A quick reminder:</h3>
      <p style="font-size: 15px; line-height: 1.7; color: #a1b0c0; margin: 0 0 40px 0;">
        Real yield doesn't happen on autopilot but this comes close. Your money is now backed by real business revenue, private credit pools, or government treasuries. No speculation. No token emissions. Just real assets paying you on a real schedule.
      </p>

      <!-- Socials -->
      <div style="background-color: #121A27; border-radius: 16px; padding: 24px; margin-bottom: 40px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff;">Let's stay connected</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #7B8B9A; margin: 0 0 20px 0;">
          We share updates, yield reports, and occasional alpha on our socials. Come say hi:
        </p>
        <div style="font-size: 14px; line-height: 2;">
          🐦 Twitter/X: <a href="https://x.com/BitsaveProtocol" style="color: #81D7B4; text-decoration: none; font-weight: 500;">https://x.com/BitsaveProtocol</a><br/>
          💬 Telegram: <a href="https://t.me/bitsaveprotocol" style="color: #81D7B4; text-decoration: none; font-weight: 500;">https://t.me/bitsaveprotocol</a><br/>
          📺 YouTube: <a href="https://www.youtube.com/@bitsaveprotocol" style="color: #81D7B4; text-decoration: none; font-weight: 500;">https://www.youtube.com/@bitsaveprotocol</a><br/>
          ✉️ Substack: <a href="https://bitsaveprotocol.substack.com" style="color: #81D7B4; text-decoration: none; font-weight: 500;">https://bitsaveprotocol.substack.com</a>
        </div>
      </div>

      <!-- Footer -->
      <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #ffffff;">One last thing</h3>
      <p style="font-size: 14px; line-height: 1.7; color: #a1b0c0; margin: 0;">
        If you ever have questions about your BizShare, your payouts, or just want to understand RWAs better reply to this email. I read every one. Or send a message on our Telegram <a href="https://t.me/bitsaveprotocol" style="color: #81D7B4; text-decoration: none;">https://t.me/bitsaveprotocol</a><br/><br/>
        <strong style="color: #ffffff;">KarlaGod</strong><br/>
        Founder, Bitsave Protocol
      </p>

    </div>
  </div>
  
  <div style="text-align: center; margin-top: 24px; color: #4b5563; font-size: 12px;">
    &copy; 2026 Bitsave Protocol. All rights reserved.
  </div>
</div>
    `;

        await transporter.sendMail({
          from: `"Bitsave Protocol" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'RWA Yield Secured with BizShares 📑',
          html: htmlContent,
        });
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      data: purchaseRecord
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

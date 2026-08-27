import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import nodemailer from "nodemailer";

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'support@bitsave.io',
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false, ciphers: 'SSLv3' }
  });
};

const sendWelcomeEmail = async (email: string, businessName: string, transactionHash: string) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"BizFi Support" <support@bitsave.io>`,
      to: email,
      subject: 'Welcome to BizFi! Your Business is Now Onchain',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F1825 !important; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { color: #81D7B4; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
          .tagline { color: #7B8B9A; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
          .card { background-color: #1A2538; border-radius: 20px; padding: 40px; border: 1px solid #233248; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
          .title { color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; letter-spacing: -0.5px; }
          .text { color: #9BA9B4; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0; }
          .highlight { color: #81D7B4; font-weight: 600; }
          .button-container { text-align: center; margin: 40px 0; }
          .button { background-color: #81D7B4; color: #0F1825 !important; font-size: 16px; font-weight: 700; padding: 18px 40px; border-radius: 12px; text-decoration: none; display: inline-block; transition: all 0.2s ease; }
          .tx-box { background-color: #0F1825; border: 1px solid #233248; border-radius: 12px; padding: 20px; margin-top: 30px; word-break: break-all; }
          .tx-label { color: #7B8B9A; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: 600; }
          .tx-hash { color: #81D7B4; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 14px; margin: 0; opacity: 0.9; line-height: 1.5; }
          .footer { text-align: center; margin-top: 40px; }
          .footer p { color: #5F6D7A; font-size: 13px; margin: 8px 0; }
          .footer a { color: #81D7B4; text-decoration: none; }
        </style>
        </head>
        <body style="background-color: #0F1825; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0F1825; width: 100%;">
            <tr>
              <td align="center">
                <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: left;">
                  <div class="header" style="text-align: center; margin-bottom: 40px;">
                    <h1 class="logo" style="color: #81D7B4; font-size: 32px; font-weight: 800; margin: 0;">BizFi</h1>
                    <p class="tagline" style="color: #7B8B9A; font-size: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Build Globally &bull; Raise Globally</p>
                  </div>
                  
                  <div class="card" style="background-color: #1A2538; border-radius: 20px; padding: 40px; border: 1px solid #233248;">
                    <h2 class="title" style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">Congratulations on Listing!</h2>
                    
                    <p class="text" style="color: #9BA9B4; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">Hello,</p>
                    
                    <p class="text" style="color: #9BA9B4; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                      Great job taking the bold step to list <strong class="highlight" style="color: #81D7B4;">${businessName}</strong> on BizFi! Your business has been successfully registered onchain.
                    </p>

                    <div class="button-container" style="text-align: center; margin: 40px 0;">
                      <a href="https://bitsave.io/bizfi/dashboard/launchpad" class="button" style="background-color: #81D7B4; color: #0F1825; font-size: 16px; font-weight: 700; padding: 18px 40px; border-radius: 12px; text-decoration: none; display: inline-block;">
                        Go to Launchpad
                      </a>
                    </div>
                    
                    <p class="text" style="color: #9BA9B4; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                      You can now view your business details and begin tracking your onchain footprint through your business launchpad. Over the next few weeks, we'll share resources on how to scale and eventually tokenize your operations.
                    </p>
                    
                    <div class="tx-box" style="background-color: #0F1825; border: 1px solid #233248; border-radius: 12px; padding: 20px; margin-top: 30px;">
                      <span class="tx-label" style="color: #7B8B9A; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: 600;">Transaction Hash</span>
                      <p class="tx-hash" style="color: #81D7B4; font-family: monospace; font-size: 14px; margin: 0; word-break: break-all;">${transactionHash}</p>
                    </div>
                  </div>
                  
                  <div class="footer" style="text-align: center; margin-top: 40px;">
                    <p style="color: #5F6D7A; font-size: 13px; margin: 8px 0;">Questions? Contact us at <a href="mailto:support@bitsave.io" style="color: #81D7B4; text-decoration: none;">support@bitsave.io</a></p>
                    <p style="color: #5F6D7A; font-size: 13px; margin: 8px 0;">&copy; ${new Date().getFullYear()} Bitsave Protocol</p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    console.log("Welcome email sent to:", email);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
};

const COLLECTION_NAME = "businesses";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    const {
      transactionHash,
      owner,
      businessName,
      metadata,
      tier,
      feePaid,
      referralCode
    } = body;

    if (!transactionHash || !owner || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const businessRecord = {
      transactionHash,
      owner: owner.toLowerCase(),
      businessName,
      metadata, // Full form data
      tier: tier || 'builder',
      feePaid,
      referralCode: referralCode || "",
      createdAt: new Date(),
      status: "pending" // Initial status
    };

    // Insert the business record
    await db.collection(COLLECTION_NAME).insertOne(businessRecord);

    // Attempt to send welcome email if email provided
    const businessEmail = metadata?.email || metadata?.businessEmail || metadata?.ceoEmail || metadata?.entCeoEmail;
    if (businessEmail) {
      sendWelcomeEmail(businessEmail, businessName, transactionHash).catch(console.error);
    }

    return NextResponse.json({ success: true, id: businessRecord.transactionHash });
  } catch (e: any) {
    const timestamp = new Date().toISOString();
    console.error(`[Business API Error] ${timestamp} | Context: Save Record`);
    console.error(`[Business API Error] Payload Summary: Owner=${body?.owner}, Name=${body?.businessName}`);
    console.error(`[Business API Error] Details:`, e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const transactionHash = searchParams.get("transactionHash");
  const limitParam = searchParams.get("limit");

  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    let query: any = {};
    if (transactionHash) {
      query = {
        $or: [
          { transactionHash: transactionHash },
          { transactionHash: { $regex: `^${transactionHash}$`, $options: 'i' } }
        ]
      };
    } else if (owner) {
      const rawOwners = owner.split(',').map(o => o.trim()).filter(Boolean);
      
      const exactStrings = Array.from(
        new Set(rawOwners.flatMap(o => [o, o.toLowerCase(), o.toUpperCase()]))
      );

      const orList: any[] = [
        { owner: { $in: exactStrings } },
        { "metadata.email": { $in: exactStrings } },
        { "metadata.businessEmail": { $in: exactStrings } },
        { "metadata.ceoEmail": { $in: exactStrings } },
        { "metadata.entCeoEmail": { $in: exactStrings } },
        { "metadata.owner": { $in: exactStrings } },
        { "metadata.walletAddress": { $in: exactStrings } },
        { "metadata.wallet": { $in: exactStrings } }
      ];

      for (const o of rawOwners) {
        if (!o) continue;
        const escaped = o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orList.push({ owner: { $regex: escaped, $options: 'i' } });
        orList.push({ "metadata.email": { $regex: escaped, $options: 'i' } });
        orList.push({ "metadata.businessEmail": { $regex: escaped, $options: 'i' } });
        orList.push({ "metadata.ceoEmail": { $regex: escaped, $options: 'i' } });
        orList.push({ "metadata.entCeoEmail": { $regex: escaped, $options: 'i' } });
        orList.push({ "metadata.owner": { $regex: escaped, $options: 'i' } });
      }

      query = { $or: orList };
    }

    let cursor = db.collection(COLLECTION_NAME).find(query).sort({ createdAt: -1 });
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (limit > 0) cursor = cursor.limit(limit);
    }

    const businesses = await cursor.toArray();
    return NextResponse.json(businesses);
  } catch (e) {
    console.error("[Business API GET Error]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

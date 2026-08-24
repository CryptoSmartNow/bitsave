import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE || 'fallback-dev-only');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { feedbackId, replyMessage, newStatus, recipientEmail } = await req.json();

    if (!feedbackId || !replyMessage?.trim()) {
      return NextResponse.json({ error: 'Feedback ID and reply message are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const db = client.db('bitsave');
    const feedbackDoc = await db.collection('feedback_submissions').findOne({
      _id: new ObjectId(feedbackId),
    });

    if (!feedbackDoc) {
      return NextResponse.json({ error: 'Feedback submission not found' }, { status: 404 });
    }

    const targetEmail = recipientEmail || feedbackDoc.email;
    let emailSent = false;
    let emailError = null;

    // Send email notification if user provided an email
    if (targetEmail && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
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

        const htmlContent = `
<div style="background-color: #070A0F; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F9F9FB;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0d131f; border-radius: 20px; border: 1px solid #1c2538; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);">
    <div style="height: 6px; background: linear-gradient(90deg, #34d399 0%, #81D7B4 50%, #3B82F6 100%); width: 100%;"></div>
    
    <div style="padding: 36px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">Bitsave Team Response 💬</h2>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #a1b0c0; margin: 0 0 20px 0;">
        Hello${feedbackDoc.savvyName ? ` <strong>${feedbackDoc.savvyName}</strong>` : ''},
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #a1b0c0; margin: 0 0 24px 0;">
        Thank you for submitting feedback regarding: <em style="color: #81D7B4;">"${feedbackDoc.subject}"</em>. Our developer team has reviewed your submission:
      </p>

      <!-- Admin Reply Box -->
      <div style="background-color: #121A27; border-left: 4px solid #81D7B4; border-radius: 0 14px 14px 0; padding: 20px; margin-bottom: 28px;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #F9F9FB; white-space: pre-wrap;">${replyMessage.trim()}</p>
      </div>

      <!-- Original Message Reference -->
      <div style="background-color: rgba(28, 37, 56, 0.3); border: 1px dashed #1C2538; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #7B8B9A; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Your Original Message:</p>
        <p style="margin: 0; font-size: 13px; color: #94A3B8; font-style: italic;">"${feedbackDoc.message}"</p>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <a href="https://bitsave.io/feedback" style="display: inline-block; background-color: #81D7B4; color: #070A0F; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 10px;">
          Go to Bitsave Platform
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #1C2538; margin: 0 0 20px 0;" />
      
      <p style="font-size: 12px; color: #7B8B9A; margin: 0;">
        Bitsave Protocol Support &middot; Built for seamless financial sovereignty
      </p>
    </div>
  </div>
</div>
        `;

        await transporter.sendMail({
          from: `"Bitsave Support" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          subject: `Update on your feedback: "${feedbackDoc.subject}" 💬`,
          html: htmlContent,
        });

        emailSent = true;
      } catch (err: any) {
        console.error('Failed to send reply email:', err);
        emailError = err.message;
      }
    }

    const replyEntry = {
      id: new ObjectId().toString(),
      message: replyMessage.trim(),
      sentBy: 'Dev Admin',
      sentToEmail: targetEmail || null,
      emailSent,
      createdAt: new Date(),
    };

    const statusToSet = newStatus || 'resolved';

    await db.collection('feedback_submissions').updateOne(
      { _id: new ObjectId(feedbackId) },
      {
        $push: { replies: replyEntry } as any,
        $set: {
          status: statusToSet,
          updatedAt: new Date(),
          lastReplyAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Reply sent to user email and logged!' : 'Reply logged to feedback thread!',
      emailSent,
      emailError,
      status: statusToSet,
    });

  } catch (error: any) {
    console.error('Error replying to feedback:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

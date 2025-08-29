import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Cleanup endpoint to clear email OTPs and connections for testing
export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress, action } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    if (action === 'clear_otp') {
      if (!email || !walletAddress) {
        return NextResponse.json(
          { error: 'Email and wallet address are required for OTP cleanup' },
          { status: 400 }
        );
      }

      // Clear specific OTP
      const otpCollection = db.collection('email_otps');
      const otpKey = `${email}_${walletAddress}`;
      
      const result = await otpCollection.deleteOne({ key: otpKey });
      
      return NextResponse.json(
        { 
          message: 'OTP cleared successfully', 
          success: true,
          deletedCount: result.deletedCount
        },
        { status: 200 }
      );
    }

    if (action === 'clear_all_otps') {
      // Clear all OTPs (for complete reset)
      const otpCollection = db.collection('email_otps');
      const result = await otpCollection.deleteMany({});
      
      return NextResponse.json(
        { 
          message: 'All OTPs cleared successfully', 
          success: true,
          deletedCount: result.deletedCount
        },
        { status: 200 }
      );
    }

    if (action === 'clear_email_connections') {
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address is required for email connection cleanup' },
          { status: 400 }
        );
      }

      // Clear email connections (if you have a collection for verified emails)
      // This is a placeholder - adjust based on your actual email storage structure
      const emailCollection = db.collection('user_emails');
      const result = await emailCollection.deleteMany({ walletAddress });
      
      return NextResponse.json(
        { 
          message: 'Email connections cleared successfully', 
          success: true,
          deletedCount: result.deletedCount
        },
        { status: 200 }
      );
    }

    if (action === 'reset_user') {
      if (!email || !walletAddress) {
        return NextResponse.json(
          { error: 'Email and wallet address are required for user reset' },
          { status: 400 }
        );
      }

      // Complete reset for a specific user
      const otpCollection = db.collection('email_otps');
      const emailCollection = db.collection('user_emails');
      
      const otpKey = `${email}_${walletAddress}`;
      
      const [otpResult, emailResult] = await Promise.all([
        otpCollection.deleteMany({ 
          $or: [
            { key: otpKey },
            { email: email },
            { walletAddress: walletAddress }
          ]
        }),
        emailCollection.deleteMany({ 
          $or: [
            { email: email },
            { walletAddress: walletAddress }
          ]
        })
      ]);
      
      return NextResponse.json(
        { 
          message: 'User data reset successfully', 
          success: true,
          otpDeleted: otpResult.deletedCount,
          emailConnectionsDeleted: emailResult.deletedCount
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: clear_otp, clear_all_otps, clear_email_connections, or reset_user' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Failed to process cleanup request' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current OTP status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const walletAddress = searchParams.get('walletAddress');

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const otpCollection = db.collection('email_otps');
    
    if (email && walletAddress) {
      // Check specific OTP
      const otpKey = `${email}_${walletAddress}`;
      const otp = await otpCollection.findOne({ key: otpKey });
      
      return NextResponse.json(
        { 
          hasOTP: !!otp,
          otpData: otp ? {
            email: otp.email,
            walletAddress: otp.walletAddress,
            timestamp: otp.timestamp,
            expiresAt: otp.expiresAt,
            isExpired: new Date() > otp.expiresAt
          } : null
        },
        { status: 200 }
      );
    } else {
      // Get all OTPs count
      const count = await otpCollection.countDocuments();
      const allOTPs = await otpCollection.find({}).toArray();
      
      return NextResponse.json(
        { 
          totalOTPs: count,
          otps: allOTPs.map(otp => ({
            key: otp.key,
            email: otp.email,
            walletAddress: otp.walletAddress,
            timestamp: otp.timestamp,
            expiresAt: otp.expiresAt,
            isExpired: new Date() > otp.expiresAt
          }))
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Cleanup GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to get OTP status' },
      { status: 500 }
    );
  }
}
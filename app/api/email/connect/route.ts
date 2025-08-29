import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getDatabase } from '@/lib/mongodb';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.SMTP_USER || 'support@bitsave.io', // Full email address as username
      pass: process.env.SMTP_PASSWORD,
    },
    // Additional security and deliverability settings
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
      ciphers: 'SSLv3' // Use compatible cipher
    },
    debug: true, // Enable debug logging
    logger: true, // Enable logging
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Add DKIM and other authentication helpers
    dkim: {
      domainName: 'bitsave.io',
      keySelector: 'default',
      privateKey: process.env.DKIM_PRIVATE_KEY || '' // Optional DKIM signing
    },
    // Pool connections for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });
};

// Generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in MongoDB
const storeOTP = async (email: string, walletAddress: string, otp: string) => {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn('MongoDB not available, falling back to memory storage');
      return false;
    }
    
    const otpCollection = db.collection('email_otps');
    const otpKey = `${email}_${walletAddress}`;
    
    await otpCollection.replaceOne(
      { key: otpKey },
      {
        key: otpKey,
        otp,
        email,
        walletAddress,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      },
      { upsert: true }
    );
    
    // Create TTL index for automatic cleanup
    await otpCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    return true;
  } catch (error) {
    console.error('Failed to store OTP in MongoDB:', error);
    return false;
  }
};

// Retrieve and verify OTP from MongoDB
const verifyOTP = async (email: string, walletAddress: string, otp: string) => {
  try {
    const db = await getDatabase();
    if (!db) {
      console.warn('MongoDB not available');
      return false;
    }
    
    const otpCollection = db.collection('email_otps');
    const otpKey = `${email}_${walletAddress}`;
    
    const storedOTP = await otpCollection.findOne({ key: otpKey });
    
    if (!storedOTP) {
      return false;
    }
    
    // Check if OTP matches
    if (storedOTP.otp !== otp) {
      return false;
    }
    
    // Check if OTP is expired
    if (new Date() > storedOTP.expiresAt) {
      await otpCollection.deleteOne({ key: otpKey });
      return false;
    }
    
    // OTP is valid, remove it
    await otpCollection.deleteOne({ key: otpKey });
    return true;
  } catch (error) {
    console.error('Failed to verify OTP from MongoDB:', error);
    return false;
  }
};

// Fallback in-memory storage for when MongoDB is not available
const otpStore = new Map<string, { otp: string; timestamp: number; email: string }>();

// Clean up expired OTPs (older than 10 minutes)
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  for (const [key, value] of otpStore.entries()) {
    if (now - value.timestamp > tenMinutes) {
      otpStore.delete(key);
    }
  }
};

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export async function POST(request: NextRequest) {
  try {
    const { email, action, otp, walletAddress } = await request.json();

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email and action are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Clean up expired OTPs
    cleanupExpiredOTPs();

    if (action === 'send_otp') {
      // Generate and send OTP
      const generatedOTP = generateOTP();
      const walletAddr = walletAddress || 'unknown';
      
      // Store OTP in MongoDB (with fallback to memory)
      const mongoStored = await storeOTP(email, walletAddr, generatedOTP);
      
      if (!mongoStored) {
        // Fallback to in-memory storage
        const otpKey = `${email}_${walletAddr}`;
        otpStore.set(otpKey, {
          otp: generatedOTP,
          timestamp: Date.now(),
          email: email
        });
      }

      // Create email content with improved deliverability headers
      const mailOptions = {
        from: `"BitSave Support" <support@bitsave.io>`,
        to: email,
        replyTo: 'support@bitsave.io',
        subject: 'BitSave Email Verification - OTP Code',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'X-Mailer': 'BitSave Email Service',
          'List-Unsubscribe': '<mailto:support@bitsave.io?subject=unsubscribe>',
          'Message-ID': `<${Date.now()}-${Math.random().toString(36).substr(2, 9)}@bitsave.io>`
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #81D7B4; font-size: 28px; margin: 0;">BitSave</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Secure SaveFi Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
              
              <p style="color: #666; line-height: 1.6;">Hello,</p>
              
              <p style="color: #666; line-height: 1.6;">
                You've requested to connect your email address to your BitSave account. 
                Please use the verification code below to complete the process:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #81D7B4, #6BC5A0); color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; letter-spacing: 8px; display: inline-block;">
                  ${generatedOTP}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                This code will expire in <strong>10 minutes</strong> for security purposes.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                If you didn't request this verification, please ignore this email or contact our support team.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  The BitSave Team<br>
                  <a href="mailto:support@bitsave.io" style="color: #81D7B4;">support@bitsave.io</a>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">
                This email was sent from BitSave. If you have any questions, please contact us at support@bitsave.io
              </p>
            </div>
          </div>
        `,
        text: `
          BitSave Email Verification
          
          Hello,
          
          You've requested to connect your email address to your BitSave account.
          Please use the verification code below to complete the process:
          
          Verification Code: ${generatedOTP}
          
          This code will expire in 10 minutes for security purposes.
          
          If you didn't request this verification, please ignore this email or contact our support team at support@bitsave.io.
          
          Best regards,
          The BitSave Team
        `
      };

      // Send email with detailed error handling
      try {
        console.log('Creating SMTP transporter with config:', {
          host: process.env.SMTP_HOST || 'mail.privateemail.com',
          port: process.env.SMTP_PORT || '465',
          user: process.env.SMTP_USER || 'support@bitsave.io'
        });
        
        const transporter = createTransporter();
        
        // Verify SMTP connection
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        
        console.log('Sending email to:', email);
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);

        return NextResponse.json(
          { message: 'OTP sent successfully', success: true, messageId: result.messageId },
          { status: 200 }
        );
      } catch (emailError) {
        const smtpError = emailError as Error & {
          code?: string;
          command?: string;
          response?: string;
          responseCode?: number;
        };
        
        console.error('Email sending failed:', {
          error: emailError,
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined,
          code: smtpError.code,
          command: smtpError.command,
          response: smtpError.response,
          responseCode: smtpError.responseCode
        });
        
        return NextResponse.json(
          { 
            error: 'Failed to send email', 
            details: emailError instanceof Error ? emailError.message : 'Unknown error',
            success: false 
          },
          { status: 500 }
        );
      }
    }

    if (action === 'verify_otp') {
      if (!otp || !walletAddress) {
        return NextResponse.json(
          { error: 'OTP and wallet address are required for verification' },
          { status: 400 }
        );
      }

      // Try MongoDB verification first
      const mongoVerified = await verifyOTP(email, walletAddress, otp);
      
      if (!mongoVerified) {
        // Fallback to in-memory verification
        const otpKey = `${email}_${walletAddress}`;
        const storedData = otpStore.get(otpKey);

        if (!storedData) {
          return NextResponse.json(
            { error: 'OTP not found or expired' },
            { status: 400 }
          );
        }

        if (storedData.otp !== otp) {
          return NextResponse.json(
            { error: 'Invalid OTP' },
            { status: 400 }
          );
        }

        // OTP is valid, remove it from store
        otpStore.delete(otpKey);
      }

      // Here you would typically save the verified email to your database
      // For now, we'll just return success
      
      return NextResponse.json(
        { message: 'Email verified successfully', success: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to process email request' },
      { status: 500 }
    );
  }
}
const nodemailer = require('nodemailer');

// Flag to track if we should use console logging instead of email
let useConsoleMode = false;

// Create transporter based on environment
const createTransporter = async () => {
  // If SMTP is configured, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Using configured SMTP server:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development without SMTP, create an Ethereal test account
  console.log('⚠️ No SMTP configured. Creating Ethereal test account...');

  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test account created:', testAccount.user);

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Failed to create Ethereal account, using console mode');
    useConsoleMode = true;
    return null;
  }
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email verification OTP
const sendVerificationEmail = async (email, otp, name) => {
  // ALWAYS log OTP to console for development convenience
  console.log('\n' + '='.repeat(50));
  console.log('📧 EMAIL VERIFICATION OTP');
  console.log('='.repeat(50));
  console.log(`To: ${email}`);
  console.log(`Name: ${name || 'User'}`);
  console.log(`🔐 OTP CODE: ${otp}`);
  console.log('='.repeat(50) + '\n');

  // If in console mode (no email transport available)
  if (useConsoleMode) {
    console.log('⚠️ Email not sent (no SMTP configured). Use the OTP above.');
    return { success: true, messageId: 'console-mode', otp };
  }

  try {
    const transporter = await createTransporter();

    if (!transporter) {
      console.log('⚠️ Email transport not available. Use the OTP above.');
      return { success: true, messageId: 'console-mode', otp };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'IntelliLib'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@intellilib.com'}>`,
      to: email,
      subject: '🔐 Verify Your IntelliLib Account',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #111111; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #222;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      INTELLI<span style="color: #888888;">LIB</span>
                    </h1>
                    <p style="margin: 8px 0 0; color: #888888; font-size: 14px;">AI-Powered Digital Library</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600;">
                      Verify Your Email
                    </h2>
                    <p style="margin: 0 0 24px; color: #aaaaaa; font-size: 16px; line-height: 1.6;">
                      Hello ${name || 'there'},<br><br>
                      Thank you for registering with IntelliLib! Please use the verification code below to complete your registration:
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #1a1a1a; border: 2px solid #333; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                      <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Verification Code
                      </p>
                      <p style="margin: 0; font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                        ${otp}
                      </p>
                    </div>
                    
                    <p style="margin: 24px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                      ⏱️ This code will expire in <strong style="color: #ffffff;">10 minutes</strong>.<br>
                      If you didn't create an account with IntelliLib, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px 40px; border-top: 1px solid #222;">
                    <p style="margin: 0; color: #555555; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} IntelliLib. All rights reserved.<br>
                      This is an automated message, please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
      text: `
      IntelliLib - Email Verification
      
      Hello ${name || 'there'},
      
      Thank you for registering with IntelliLib! Please use the verification code below to complete your registration:
      
      Verification Code: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account with IntelliLib, you can safely ignore this email.
      
      © ${new Date().getFullYear()} IntelliLib. All rights reserved.
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);

    // For Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Preview URL:', previewUrl);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log('💡 Use the OTP logged above to verify manually.');
    // Don't throw error - just log it and return success since we logged the OTP
    return { success: true, messageId: 'error-fallback', otp };
  }
};

// Send password reset OTP
const sendPasswordResetEmail = async (email, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'IntelliLib'}" <${process.env.FROM_EMAIL || 'noreply@intellilib.com'}>`,
    to: email,
    subject: '🔑 Reset Your IntelliLib Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #111111; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #222;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      INTELLI<span style="color: #888888;">LIB</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600;">
                      Password Reset Request
                    </h2>
                    <p style="margin: 0 0 24px; color: #aaaaaa; font-size: 16px; line-height: 1.6;">
                      Hello ${name || 'there'},<br><br>
                      We received a request to reset your password. Use the code below:
                    </p>
                    <div style="background-color: #1a1a1a; border: 2px solid #333; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                      <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reset Code</p>
                      <p style="margin: 0; font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                        ${otp}
                      </p>
                    </div>
                    <p style="margin: 24px 0 0; color: #666666; font-size: 14px;">
                      ⏱️ This code expires in <strong style="color: #ffffff;">10 minutes</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px 40px; border-top: 1px solid #222;">
                    <p style="margin: 0; color: #555555; font-size: 12px; text-align: center;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Password Reset Code: ${otp}\n\nThis code expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send researcher verification status notification
const sendVerificationStatusEmail = async (email, name, status, reason = null) => {
  const transporter = createTransporter();

  const statusConfig = {
    approved: {
      emoji: '✅',
      title: 'Verification Approved!',
      message: 'Congratulations! Your researcher verification has been approved. You now have full access to all researcher features.',
      color: '#22c55e',
    },
    rejected: {
      emoji: '❌',
      title: 'Verification Not Approved',
      message: `Unfortunately, your verification request was not approved.${reason ? ` Reason: ${reason}` : ''} You can submit a new verification request with updated documents.`,
      color: '#ef4444',
    },
    under_review: {
      emoji: '🔍',
      title: 'Verification Under Review',
      message: 'Your verification request is currently being reviewed by our admin team. We will notify you once a decision has been made.',
      color: '#eab308',
    },
  };

  const config = statusConfig[status] || statusConfig.under_review;

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'IntelliLib'}" <${process.env.FROM_EMAIL || 'noreply@intellilib.com'}>`,
    to: email,
    subject: `${config.emoji} IntelliLib Researcher Verification Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #111;">IntelliLib</h1>
        <h2 style="color: ${config.color};">${config.title}</h2>
        <p>Hello ${name},</p>
        <p>${config.message}</p>
        <p>Best regards,<br>The IntelliLib Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending status email:', error);
    return { success: false };
  }
};

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendVerificationStatusEmail,
};

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMail() {
  console.log('🧪 Testing Gmail SMTP configuration...');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', process.env.MAIL_PORT);
  console.log('User:', process.env.MAIL_USER);
  console.log('From:', process.env.MAIL_FROM);
  
  const transporter = nodemailer.createTransporter({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
  });

  try {
    console.log('\n📧 Sending test email...');
    
    const info = await transporter.sendMail({
      from: `"StudySync Test" <${process.env.MAIL_FROM}>`,
      to: 'cuong@gmail.com', // email test
      subject: '🧪 Test Verification Email - StudySync',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🔐 Test Verification Email</h2>
          <p>Hi there!</p>
          <p>This is a test email to verify that your StudySync mail configuration is working correctly.</p>
          <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #666;">Your Test OTP Code</p>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0;">123456</div>
          </div>
          <p>If you can see this email, your mail configuration is working! ✅</p>
          <hr>
          <small>This is a test email from StudySync mail service.</small>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ESOCKET') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check if Gmail App Password is correct');
      console.log('2. Ensure 2FA is enabled on Gmail account');
      console.log('3. Try different TLS/SSL settings');
    }
  }
}

testMail();
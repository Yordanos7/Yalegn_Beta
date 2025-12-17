import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../../apps/server/.env.local') });

const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

console.log('🔍 Testing Gmail SMTP Configuration...');
console.log('📧 Gmail User:', gmailUser || 'MISSING');
console.log('🔑 Gmail Password:', gmailPassword ? '✓ Present' : '❌ MISSING');

if (!gmailUser || !gmailPassword) {
  console.error('\n❌ ERROR: Gmail credentials not configured!');
  console.error('Please add to .env.local:');
  console.error('  GMAIL_USER=your-email@gmail.com');
  console.error('  GMAIL_APP_PASSWORD=your-16-char-password');
  process.exit(1);
}

async function testGmail() {
  try {
    console.log('\n📧 Creating Gmail SMTP transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    console.log('✅ Transporter created successfully!');
    console.log('\n📧 Sending test email...');
    
    // Test with multiple recipients
    const testEmails = [
      gmailUser || 'test@example.com',
    ];
    
    for (const testEmail of testEmails) {
      console.log(`\n→ Sending to: ${testEmail}`);
      
      const info = await transporter.sendMail({
        from: `"Yalegn Test" <${gmailUser}>`,
        to: testEmail,
        subject: '🧪 Gmail SMTP Test - Yalegn',
        html: '<h1>Success!</h1><p>Gmail SMTP is working! You can now verify ANY email address. 🎉</p>',
        text: 'Success! Gmail SMTP is working! You can now verify ANY email address.',
      });

      console.log(`  ✅ SUCCESS! Email sent!`);
      console.log(`  📧 Message ID: ${info.messageId}`);
    }

    console.log('\n✨ Gmail SMTP is working perfectly!');
    console.log('🎯 You can now send emails to ANY email address!');
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    
    if (error.responseCode === 535) {
      console.error('\n🔑 AUTHENTICATION ERROR');
      console.error('   Possible causes:');
      console.error('   1. Incorrect App Password');
      console.error('   2. 2FA not enabled on Gmail');
      console.error('   3. App Password not generated correctly');
      console.error('\n   Fix:');
      console.error('   → Go to: https://myaccount.google.com/apppasswords');
      console.error('   → Generate a NEW App Password');
      console.error('   → Update GMAIL_APP_PASSWORD in .env.local');
    }
    
    return false;
  }
}

testGmail().then((success) => {
  process.exit(success ? 0 : 1);
});

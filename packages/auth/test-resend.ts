import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../../apps/server/.env.local') });

const apiKey = process.env.RESEND_API_KEY;

console.log('🔍 Testing Resend API Configuration...');
console.log('📝 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

if (!apiKey) {
  console.error('❌ RESEND_API_KEY is missing');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testResend() {
  try {
    console.log('\n📧 Attempting to send test email...');
    
    const { data, error } = await resend.emails.send({
      from: 'Yalegn <onboarding@resend.dev>',
      to: process.env.RESEND_ACCOUNT_EMAIL || 'test@example.com', // MUST match RESEND_ACCOUNT_EMAIL for test mode
      subject: '🧪 Resend API Test - Yalegn',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working!</p>',
    });

    if (error) {
      console.error('\n❌ Resend Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Specific error handling
      if (error.message?.includes('API key')) {
        console.error('\n🔑 SOLUTION: Your Resend API key may be invalid or not activated.');
        console.error('   👉 Go to https://resend.com/api-keys');
        console.error('   👉 Verify your email address');
        console.error('   👉 Create a new API key');
      }
      return false;
    }

    console.log('\n✅ SUCCESS! Email sent!');
    console.log('📧 Email ID:', data?.id);
    console.log('\n✨ Resend is working correctly!');
    return true;
    
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message?.includes('fetch')) {
      console.error('\n🌐 NETWORK ISSUE DETECTED');
      console.error('   Possible causes:');
      console.error('   1. No internet connection');
      console.error('   2. Firewall blocking Resend API');
      console.error('   3. Resend service is down');
    }
    return false;
  }
}

testResend().then((success) => {
  process.exit(success ? 0 : 1);
});

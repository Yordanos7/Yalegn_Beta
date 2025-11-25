# Email Verification with Resend - Complete Setup Guide

## 🎯 Why Resend?

✅ **Works everywhere** - localhost, staging, production
✅ **Simple setup** - Just one API key
✅ **Generous free tier** - 3,000 emails/month free
✅ **Better developer experience** - Clean API, great docs
✅ **No domain verification needed** for testing (uses `onboarding@resend.dev`)
✅ **Production ready** - Add your own domain when ready

---

## 📋 Quick Setup (5 minutes)

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** section
4. Click **Create API Key**
5. Give it a name like "My Better T App"
6. Copy the API key (starts with `re_`)

### Step 2: Update Environment Variables

Open `apps/server/.env` and update:

```env
# Replace with your actual Resend API key
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# For development, use Resend's test email
RESEND_FROM_EMAIL=onboarding@resend.dev

# For production, use your verified domain
# RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Step 3: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test It!

1. Go to `http://localhost:3001/profile`
2. Click **"Send Verification Email"**
3. Check your email inbox
4. Click the verification link
5. Done! ✅

---

## 🌍 Production Deployment

### For Production URLs

Update these environment variables for your production environment:

```env
# Production API URL (your backend)
BETTER_AUTH_URL=https://api.yourdomain.com

# Production frontend URL
CORS_ORIGIN=https://yourdomain.com

# Your Resend API key (same one works everywhere)
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# Use your verified domain email
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Verify Your Domain (Optional but Recommended)

For production, verify your domain in Resend:

1. Go to Resend dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides
5. Wait for verification (usually 5-10 minutes)
6. Update `RESEND_FROM_EMAIL` to use your domain

**Benefits:**

- Better email deliverability
- Professional sender address
- No "via resend.dev" in email headers
- Higher sending limits

---

## 🧪 Testing

### Development Testing

```bash
# Start your server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{"email":"your@email.com","callbackURL":"http://localhost:3001/profile?verified=true"}'
```

### Check Resend Dashboard

1. Go to [resend.com/emails](https://resend.com/emails)
2. See all sent emails
3. View delivery status
4. Debug any issues

---

## 🎨 Email Template

The verification email includes:

- **Beautiful gradient header**
- **Personalized greeting** with user's name
- **Large verification button**
- **Fallback text link**
- **24-hour expiration notice**
- **Security notice**
- **Responsive design** (looks great on mobile)

### Preview

```
┌─────────────────────────────────────────┐
│  [Purple Gradient Header]               │
│  Verify Your Email                      │
├─────────────────────────────────────────┤
│                                         │
│  Hi [User Name],                        │
│                                         │
│  Thank you for signing up! Please       │
│  verify your email address to complete  │
│  your registration.                     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   [Verify Email Address]          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Or copy this link:                     │
│  [verification URL]                     │
│                                         │
│  ⏱️ Expires in 24 hours                 │
│  🔒 Didn't request? Ignore this email   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Configuration Options

### Custom From Name

```typescript
from: "Your App Name <noreply@yourdomain.com>";
```

### Custom Subject

```typescript
subject: "Welcome! Verify your email for Your App";
```

### Add Reply-To

```typescript
replyTo: "support@yourdomain.com";
```

### Add CC/BCC

```typescript
cc: ["admin@yourdomain.com"],
bcc: ["logs@yourdomain.com"]
```

---

## 🚨 Troubleshooting

### Email Not Received

**Check:**

1. ✅ Resend API key is correct
2. ✅ Email address is valid
3. ✅ Check spam/junk folder
4. ✅ Check Resend dashboard for delivery status

**Solution:**

```bash
# Check server logs for errors
npm run dev
# Look for "✅ Verification email sent" or "❌ Failed to send"
```

### 401 Unauthenticated Error

**Cause:** Invalid or missing Resend API key

**Solution:**

1. Verify API key in `.env` file
2. Make sure it starts with `re_`
3. Restart your server after updating `.env`

### Email Goes to Spam

**For Development:**

- This is normal with `onboarding@resend.dev`
- Check spam folder

**For Production:**

1. Verify your domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Use a professional from address
4. Avoid spam trigger words

### Link Doesn't Work

**Check:**

1. `BETTER_AUTH_URL` matches your server URL
2. Token hasn't expired (24 hours)
3. Server is running
4. CORS is configured correctly

---

## 📊 Resend Free Tier Limits

- **3,000 emails/month** - Free forever
- **100 emails/day** - Rate limit
- **No credit card required** for free tier
- **Unlimited domains** - Verify as many as you want

### Paid Plans (if you need more)

- **$20/month** - 50,000 emails
- **$80/month** - 100,000 emails
- **Custom** - Enterprise volumes

---

## 🔐 Security Best Practices

### Environment Variables

```bash
# ✅ GOOD - Use environment variables
RESEND_API_KEY=re_abc123

# ❌ BAD - Never hardcode in code
const resend = new Resend("re_abc123");
```

### API Key Permissions

- Use **separate API keys** for dev/staging/production
- Rotate keys regularly
- Revoke unused keys
- Monitor usage in Resend dashboard

### Email Content

- ✅ Use HTTPS for all links
- ✅ Include expiration time
- ✅ Add security notice
- ✅ Use branded templates
- ❌ Don't include sensitive data

---

## 🎯 Next Steps

### Immediate

1. ✅ Get Resend API key
2. ✅ Update `.env` file
3. ✅ Restart server
4. ✅ Test email verification

### Before Production

1. 🔲 Verify your domain in Resend
2. 🔲 Update `RESEND_FROM_EMAIL` to your domain
3. 🔲 Test with real users
4. 🔲 Monitor email deliverability
5. 🔲 Set up error alerts

### Optional Enhancements

1. 🔲 Add email templates for other notifications
2. 🔲 Implement password reset emails
3. 🔲 Add welcome email after verification
4. 🔲 Create email notification preferences
5. 🔲 Add email analytics tracking

---

## 📚 Resources

- **Resend Docs**: https://resend.com/docs
- **Better Auth Docs**: https://better-auth.com/docs
- **Email Best Practices**: https://resend.com/docs/send-with-nextjs
- **Domain Verification**: https://resend.com/docs/dashboard/domains/introduction

---

## ✅ Summary

Your email verification is now powered by Resend:

1. ✅ **Works everywhere** - dev, staging, production
2. ✅ **Simple setup** - just one API key
3. ✅ **Beautiful emails** - professional templates
4. ✅ **Reliable delivery** - 99.9% uptime
5. ✅ **Easy debugging** - dashboard with logs
6. ✅ **Production ready** - scales with your app

**Total setup time:** ~5 minutes
**Cost:** Free for 3,000 emails/month

You're all set! 🚀

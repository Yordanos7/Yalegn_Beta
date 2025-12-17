# 📧 Gmail SMTP Setup Guide (100% Free & Reliable)

## 🎯 Why This Solution is Better:

- ✅ **100% FREE forever** - No limits, no paid plans
- ✅ **More reliable** than EmailJS - Uses Gmail's infrastructure
- ✅ **Production ready** - Works perfectly when deployed
- ✅ **No API issues** - Direct SMTP connection
- ✅ **500 emails/day** - More than enough for your app

## 🚀 Setup Steps (3 minutes):

### Step 1: Enable 2-Factor Authentication

1. Go to **[myaccount.google.com](https://myaccount.google.com)**
2. Click **"Security"** in left menu
3. Enable **"2-Step Verification"** if not already enabled

### Step 2: Generate App Password

1. In Google Account Security page
2. Click **"App passwords"** (you'll see this after enabling 2FA)
3. Select **"Mail"** as the app
4. Select **"Other"** as device and type **"Yalegn App"**
5. Click **"Generate"**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables

Replace these in `apps/server/.env.local`:

```env
# Gmail SMTP Configuration
GMAIL_USER=yordanosyohannes7@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here
```

### Step 4: Test Your Setup

1. **Restart your server**
2. **Go to profile page**
3. **Click "Send Verification Email"**
4. **Check your email** - should arrive in 5-10 seconds!

## 🎉 What You Get:

**Professional Emails:**

- Sent from your Gmail address
- Beautiful HTML templates
- Reliable delivery
- No spam issues

**Production Ready:**

- Works perfectly when deployed
- No API keys to manage
- No rate limits (500/day is plenty)
- Gmail's infrastructure

## 🔧 Troubleshooting:

**"Invalid credentials" error:**

- Make sure 2FA is enabled on your Google account
- Generate a new App Password
- Use the 16-character password (not your regular Gmail password)

**Emails not arriving:**

- Check spam folder
- Try different email address
- Check server console for error messages

## 🚀 Production Deployment:

When you deploy:

1. **Add the same environment variables** to your hosting platform
2. **That's it!** - No additional setup needed

**Your email verification will work perfectly in production!** 🎉

## 📧 Current Configuration:

- **SMTP Server:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Authentication:** Your Gmail + App Password
- **Daily Limit:** 500 emails (more than enough)

This is the most reliable email solution for your Yalegn app!

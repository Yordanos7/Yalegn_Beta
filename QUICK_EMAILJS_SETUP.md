# 🚀 QUICK EmailJS Setup (5 Minutes)

## The 400 Error means you need real API keys. Here's the fastest way:

### Step 1: Get EmailJS Account (1 minute)

1. Go to **[emailjs.com](https://emailjs.com)**
2. Click **"Sign Up"** (FREE)
3. Use your **Gmail** to sign up

### Step 2: Connect Gmail (1 minute)

1. Click **"Email Services"** in dashboard
2. Click **"Add New Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"** → Authorize Gmail
5. **COPY the Service ID** (looks like `service_abc123`)

### Step 3: Create Template (2 minutes)

1. Click **"Email Templates"**
2. Click **"Create New Template"**
3. **Template ID:** `template_yalegn_verify` (use exactly this!)
4. **Subject:** `Verify your Yalegn account`
5. **Content:** Just paste this simple version:

```
Hi {{to_name}},

Welcome to Yalegn! Click here to verify your email:

{{verification_link}}

Thanks!
Yalegn Team
```

6. Click **"Save"**

### Step 4: Get Public Key (30 seconds)

1. Go to **"Account"** → **"General"**
2. **COPY the Public Key** (looks like `user_abc123xyz`)

### Step 5: Update Your .env.local (30 seconds)

Replace these 3 lines in `apps/web/.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_from_step_2
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yalegn_verify
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_from_step_4
```

### Step 6: Test (30 seconds)

1. **Restart your dev server**
2. **Try email verification** from profile page
3. **Check browser console** - should show real API keys now
4. **Check your email** - should arrive in 10-30 seconds

## 🎯 That's it!

The error will disappear once you have real API keys. The current error is because you're using placeholder values.

**Need help?** The detailed setup guide is in `EMAILJS_SETUP_GUIDE.md`

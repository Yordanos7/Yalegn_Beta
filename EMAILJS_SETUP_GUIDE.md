# 📧 EmailJS Setup Guide - 100% Free Email Verification

## 🎯 What You Need to Do:

### Step 1: Create EmailJS Account (2 minutes)

1. Go to [emailjs.com](https://emailjs.com)
2. Click "Sign Up" (it's FREE forever)
3. Use your Gmail account to sign up

### Step 2: Connect Your Gmail (1 minute)

1. In EmailJS dashboard, click "Email Services"
2. Click "Add New Service"
3. Select "Gmail"
4. Click "Connect Account" and authorize with your Gmail
5. **Copy the Service ID** (looks like `service_xxxxxxx`)

### Step 3: Create Email Template (3 minutes)

1. Click "Email Templates" in dashboard
2. Click "Create New Template"
3. **Template Name:** `Yalegn Email Verification`
4. **Template ID:** `template_yalegn_verify` (use exactly this)
5. **Subject:** `✨ Verify your Yalegn account - Welcome!`
6. **Content:** Paste this HTML:

```html
<div
  style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"
>
  <div
    style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;"
  >
    <h1 style="color: white; margin: 0; font-size: 28px;">
      Welcome to {{app_name}}!
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
      Verify your email to get started
    </p>
  </div>

  <div
    style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;"
  >
    <h2 style="color: #1f2937; margin: 0 0 16px 0;">Hi {{to_name}}! 👋</h2>

    <p style="color: #4b5563; margin: 0 0 24px 0; line-height: 1.6;">
      Thank you for joining Yalegn! Click the button below to verify your email
      and get 30 welcome coins.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a
        href="{{verification_link}}"
        style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold;"
      >
        ✨ Verify My Email
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
      Or copy this link: {{verification_link}}
    </p>

    <div
      style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;"
    >
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © 2024 Yalegn. All rights reserved.
      </p>
    </div>
  </div>
</div>
```

7. **Variables to add:**

   - `{{to_name}}` - User's name
   - `{{to_email}}` - User's email
   - `{{verification_link}}` - Verification URL
   - `{{app_name}}` - App name (Yalegn)

8. Click "Save"

### Step 4: Get Your API Keys (1 minute)

1. Go to "Account" → "General"
2. **Copy these 3 values:**
   - **Public Key** (looks like `user_xxxxxxxxxxxxxxx`)
   - **Service ID** (from step 2)
   - **Template ID** (`template_yalegn_verify`)

### Step 5: Update Your Environment Variables

Replace these in your `.env.local` file:

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yalegn_verify
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## 🧪 Test Your Setup:

1. **Restart your development server**
2. **Try signing up** with a real email address
3. **Check your email inbox** (should arrive in 10-30 seconds)
4. **Click the verification link**

## ✅ What You Get:

- ✅ **100% FREE forever** - No limits, no paid plans
- ✅ **Reliable delivery** - Uses Gmail's infrastructure
- ✅ **Professional emails** - Beautiful HTML templates
- ✅ **Production ready** - Works perfectly when deployed
- ✅ **Your own sender** - Emails come from your Gmail
- ✅ **No server setup** - Pure client-side solution

## 🔧 Troubleshooting:

**Emails not sending?**

1. Check browser console for errors
2. Verify all 3 environment variables are correct
3. Make sure template ID is exactly `template_yalegn_verify`
4. Check EmailJS dashboard for error logs

**Template not working?**

1. Make sure all variables `{{to_name}}`, `{{verification_link}}` etc. are in the template
2. Test the template in EmailJS dashboard first

## 🚀 Production Deployment:

When you deploy to production:

1. **Add the same environment variables** to your hosting platform
2. **Update CORS settings** in EmailJS dashboard to include your production domain
3. **That's it!** - No server changes needed

Your email verification will work perfectly in production! 🎉

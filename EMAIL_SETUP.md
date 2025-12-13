# Email Verification Setup Guide

## Overview

Your email verification system is now properly configured! Here's what was fixed and how to set it up:

## Issues Fixed

1. ✅ **Email verification enabled** - Users now must verify their email before accessing the platform
2. ✅ **Email verification page created** - `/verify-email` route handles email verification
3. ✅ **Automatic email sending** - Verification emails are sent automatically on signup
4. ✅ **Resend functionality** - Users can resend verification emails if needed
5. ✅ **Security improved** - API keys are now properly hidden
6. ✅ **Reward system** - Users get 30 coins after email verification

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Create an API key in your dashboard
4. Copy the API key

### 2. Configure Environment Variables

Update your `.env` files with your actual API key:

**In `apps/server/.env`:**

```env
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Use your domain or keep the default
```

### 3. Domain Setup (Optional but Recommended)

- For production, add your domain to Resend
- Verify your domain to improve email deliverability
- Update `RESEND_FROM_EMAIL` to use your domain

## How It Works

### User Flow

1. User signs up → Account created but not verified
2. Verification email sent automatically
3. User clicks link in email → Redirected to `/verify-email?token=...`
4. Email verified → User gets 30 coins and is signed in
5. User redirected to dashboard

### Email Features

- ✨ Beautiful HTML email template
- 🔄 Resend functionality with cooldown
- ⏰ 24-hour expiration
- 🎨 Responsive design
- 🔒 Secure token-based verification

## Testing

### Development Testing

1. Start your development server
2. Sign up with a real email address
3. Check your email for the verification link
4. Click the link to verify

### Production Checklist

- [ ] Update `RESEND_API_KEY` with production key
- [ ] Set `RESEND_FROM_EMAIL` to your domain
- [ ] Update `BETTER_AUTH_URL` to your production URL
- [ ] Test email delivery in production

## Troubleshooting

### Emails Not Sending

1. Check your Resend API key is correct
2. Verify your domain in Resend (for production)
3. Check server logs for error messages

### Verification Links Not Working

1. Ensure `BETTER_AUTH_URL` matches your app URL
2. Check that the `/verify-email` page exists
3. Verify token hasn't expired (24 hours)

### Users Not Getting Coins

1. Check database connection
2. Verify `onEmailVerified` callback is working
3. Check server logs for transaction errors

## Security Notes

- ✅ API keys are now in `.env` files (not committed to git)
- ✅ Email verification prevents fake accounts
- ✅ Tokens expire after 24 hours
- ✅ Secure token-based verification system

Your email verification system is now production-ready! 🎉

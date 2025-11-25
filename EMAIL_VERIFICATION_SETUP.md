# Email Verification Setup Guide

## Current Issue

The email verification is failing with a 500 error because:

1. The `mailersend` npm package is not installed
2. The better-auth email configuration needs proper setup

## Solution Steps

### Step 1: Install MailerSend Package

```bash
npm install mailersend --workspace=@my-better-t-app/auth
```

### Step 2: Update Auth Configuration

The auth config at `packages/auth/src/index.ts` already has the custom email sending logic, but needs the package installed.

### Step 3: Verify Environment Variables

Make sure these are in `apps/server/.env`:

```
MAILERSEND_API_KEY="mlsn.049d9e526d72ca7a01c402bf6a3b91b231d72b8cef0036dc0c462ca3d4abfa4a"
MAILERSEND_FROM_EMAIL="sandbox@mailersend.net"
BETTER_AUTH_URL=http://localhost:3000
```

### Step 4: Test Email Verification

1. Start your server
2. Go to your profile page
3. Click "Verify Email" button
4. Check your email inbox (or MailerSend dashboard for sandbox emails)
5. Click the verification link

## Profile Completion Calculation

The profile completion is calculated in `apps/web/src/app/profile/page.tsx` at line 271:

```typescript
const calculateProfileCompletion = () => {
  let completedFields = 0;
  let totalFields = 9; // Name, Email, Bio, Headline, Skills, Portfolio, Location, Verification, Email Verified

  if (userProfile.name) completedFields++;
  if (userProfile.email) completedFields++;
  if (userProfile.bio) completedFields++;
  if (userProfile.headline) completedFields++;
  if (userProfile.skills && userProfile.skills.length > 0) completedFields++;
  if (userProfile.portfolio && userProfile.portfolio.length > 0)
    completedFields++;
  if (userProfile.location) completedFields++;
  if (userProfile.emailVerified) completedFields++; // Email verification counts
  // Add verification status check if needed

  return Math.round((completedFields / totalFields) * 100);
};
```

To reach 100% profile completion, users need:

1. ✅ Name
2. ✅ Email
3. ✅ Bio
4. ✅ Headline
5. ✅ Skills (at least one)
6. ✅ Portfolio (at least one item)
7. ✅ Location
8. ✅ Email Verified (this is what's currently failing)
9. ✅ Verification status (if applicable)

## Alternative: Use Resend (Simpler Setup)

If MailerSend continues to have issues, you can switch to Resend which is easier:

### Install Resend

```bash
npm install resend --workspace=@my-better-t-app/auth
```

### Update auth config

```typescript
emailVerification: {
  sendOnSignUp: false,
  sendVerificationEmail: async ({ user, url }) => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Yalegn <onboarding@resend.dev>",
      to: user.email,
      subject: "Verify your email address",
      html: `
        <h2>Verify Your Email</h2>
        <p>Hi ${user.name || "there"},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">Verify Email</a>
      `,
    });
  },
},
```

### Add to .env

```
RESEND_API_KEY=your_resend_api_key_here
```

## Quick Fix Command

Run this to install mailersend and restart:

```bash
cd my-better-t-app
npm install mailersend --workspace=@my-better-t-app/auth
npm run dev
```

## Debugging

If still having issues, check:

1. Server console logs for detailed error messages
2. MailerSend dashboard to see if emails are being sent
3. Make sure BETTER_AUTH_URL matches your actual URL
4. Check that the verification callback route exists at `/api/auth/verify-email`

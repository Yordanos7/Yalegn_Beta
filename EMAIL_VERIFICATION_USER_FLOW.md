# Email Verification - User Flow

## Visual Guide: How Users Verify Their Email

---

## 📍 Step 1: Profile Page - Unverified State

When a user visits their profile page and their email is **not verified**, they see:

```
╔═══════════════════════════════════════════════════════════╗
║                    VERIFICATION & TRUST                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  ✅ Faida ID Verified                                      ║
║  ❌ Phone Verified                                         ║
║  ❌ Email Verified                                         ║
║  ❌ Portfolio Verified                                     ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ ⚠️  Email Not Verified                               │ ║
║  │                                                       │ ║
║  │ Verify your email to increase your profile           │ ║
║  │ completion and build trust with clients.             │ ║
║  │                                                       │ ║
║  │  ┌────────────────────────────────────────────────┐  │ ║
║  │  │  📧  Send Verification Email                   │  │ ║
║  │  └────────────────────────────────────────────────┘  │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  [ Unlock all badges to build client trust ]               ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

**Profile Completion:** 78% (missing email verification)

---

## 📍 Step 2: User Clicks Button

User clicks **"Send Verification Email"** button

```
╔═══════════════════════════════════════════════════════════╗
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ ⚠️  Email Not Verified                               │ ║
║  │                                                       │ ║
║  │ Verify your email to increase your profile           │ ║
║  │ completion and build trust with clients.             │ ║
║  │                                                       │ ║
║  │  ┌────────────────────────────────────────────────┐  │ ║
║  │  │  ⏳  Sending Verification Email...             │  │ ║
║  │  └────────────────────────────────────────────────┘  │ ║
║  └──────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

**Loading state** shows spinner and "Sending..." text

---

## 📍 Step 3: Success Toast Notification

After email is sent successfully:

```
┌─────────────────────────────────────────────────────────┐
│  ✅  Verification email sent!                           │
│      Please check your inbox.                           │
└─────────────────────────────────────────────────────────┘
```

Toast appears at top-right of screen for 3 seconds

---

## 📍 Step 4: Email Received

User receives email in their inbox:

```
╔═══════════════════════════════════════════════════════════╗
║  From: Yalegn <sandbox@mailersend.net>                    ║
║  Subject: Verify your email address                       ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Verify Your Email Address                                ║
║                                                            ║
║  Hi [User Name],                                           ║
║                                                            ║
║  Please click the button below to verify your email       ║
║  address:                                                  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │           Verify Email                             │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  Or copy and paste this link into your browser:           ║
║  http://localhost:3000/api/auth/verify-email?token=...    ║
║                                                            ║
║  This link will expire in 24 hours.                       ║
║                                                            ║
║  If you didn't request this email, you can safely         ║
║  ignore it.                                                ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📍 Step 5: User Clicks Verification Link

User clicks the "Verify Email" button or link in the email

**What happens:**

1. Browser opens: `http://localhost:3000/api/auth/verify-email?token=xxx`
2. Better Auth validates the token
3. Updates `emailVerified` to `true` in database
4. Redirects to: `http://localhost:3001/profile?verified=true`

---

## 📍 Step 6: Success Confirmation

User is redirected back to profile page with success message:

```
┌─────────────────────────────────────────────────────────┐
│  ✅  Email verified successfully!                       │
│      Your email has been verified. Your profile         │
│      completion has been updated.                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📍 Step 7: Profile Page - Verified State

Profile page now shows verified status:

```
╔═══════════════════════════════════════════════════════════╗
║                    VERIFICATION & TRUST                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  ✅ Faida ID Verified                                      ║
║  ❌ Phone Verified                                         ║
║  ✅ Email Verified                                         ║
║  ❌ Portfolio Verified                                     ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ ✅ Email Verified Successfully!                      │ ║
║  │                                                       │ ║
║  │ Your email has been verified. This helps build       │ ║
║  │ trust with clients.                                  │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  [ Unlock all badges to build client trust ]               ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

**Profile Completion:** 89% (email verification complete! ✅)

---

## 🎯 Key Features

### Visual Feedback

- ✅ **Color-coded status** - Red X for unverified, Green checkmark for verified
- ✅ **Alert boxes** - Yellow warning for unverified, Green success for verified
- ✅ **Loading states** - Spinner and text while sending email
- ✅ **Toast notifications** - Success/error messages

### User Experience

- ✅ **One-click verification** - Simple button to send email
- ✅ **Clear instructions** - Tells user what to do and why
- ✅ **Automatic updates** - Profile refreshes after verification
- ✅ **Progress tracking** - Profile completion percentage updates

### Security

- ✅ **Secure tokens** - Cryptographically secure verification tokens
- ✅ **Time-limited** - Links expire after 24 hours
- ✅ **One-time use** - Tokens can only be used once
- ✅ **Protected endpoint** - Only authenticated users can request

---

## 📱 Mobile View

The email verification section is fully responsive:

```
┌─────────────────────────────┐
│  VERIFICATION & TRUST       │
├─────────────────────────────┤
│                             │
│  ✅ Faida ID Verified       │
│  ❌ Phone Verified          │
│  ❌ Email Verified          │
│  ❌ Portfolio Verified      │
│                             │
│  ┌───────────────────────┐  │
│  │ ⚠️  Email Not         │  │
│  │     Verified          │  │
│  │                       │  │
│  │ Verify your email to  │  │
│  │ increase profile      │  │
│  │ completion.           │  │
│  │                       │  │
│  │ ┌─────────────────┐   │  │
│  │ │ 📧 Send Email   │   │  │
│  │ └─────────────────┘   │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## 🔄 Error Handling

### If Email Fails to Send

```
┌─────────────────────────────────────────────────────────┐
│  ❌  Failed to send verification email.                 │
│      [Error message details]                            │
└─────────────────────────────────────────────────────────┘
```

User can click the button again to retry.

### If Token is Invalid/Expired

Better Auth handles this automatically and shows an error page.
User can return to profile and request a new verification email.

---

## 💡 Tips for Users

1. **Check spam folder** - Verification emails might end up in spam
2. **Link expires in 24 hours** - Click the link promptly
3. **One-time use** - Each link can only be used once
4. **Resend if needed** - Can request new email if link expires

---

## 🎨 Color Scheme

- **Unverified Alert**: Yellow background, yellow border
- **Verified Alert**: Green background, green border
- **Button**: Yellow/Primary color
- **Icons**: Red X (unverified), Green checkmark (verified)

---

## ✨ Summary

The email verification flow is:

1. **Simple** - One button click to start
2. **Clear** - Visual feedback at every step
3. **Fast** - Email sent within seconds
4. **Secure** - Industry-standard verification process
5. **Automatic** - Profile updates without manual refresh

Users can verify their email in under 1 minute! 🚀

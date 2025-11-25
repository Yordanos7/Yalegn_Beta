# Using Better-Auth Native Email Verification

## Overview

I've refactored the code to use better-auth's built-in email verification system instead of custom implementation. This is simpler, more secure, and better maintained.

## What Changed

### 1. Auth Configuration (`packages/auth/src/index.ts`)

- Removed custom `sendVerificationEmail` helper function
- Kept the `emailVerification` config with custom email template
- Better-auth now handles token generation, storage, and verification automatically

### 2. User Router (`packages/api/src/routers/user.ts`)

- Changed to call better-auth's `/api/auth/send-verification-email` endpoint
- No more manual token generation or database updates

### 3. Server (`apps/server/src/index.ts`)

- Removed custom `/api/auth/verify-email` endpoint
- Better-auth's `toNodeHandler(auth)` now handles ALL `/api/auth/*` routes

## How It Works

### Step 1: User Clicks "Verify Email" Button

```typescript
// In profile page
sendVerificationEmailMutation.mutate();
```

### Step 2: TRPC Calls Better-Auth

```typescript
// packages/api/src/routers/user.ts
await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/send-verification-email`, {
  method: "POST",
  body: JSON.stringify({
    email: user.email,
    callbackURL: `${process.env.CORS_ORIGIN}/profile?verified=true`,
  }),
});
```

### Step 3: Better-Auth Sends Email

- Better-auth generates a secure token
- Stores it in the database (using better-auth's own tables)
- Calls your custom `sendVerificationEmail` function with the verification URL
- The URL looks like: `http://localhost:3000/api/auth/verify-email?token=xxx&callbackURL=...`

### Step 4: User Clicks Link in Email

- Better-auth's `/api/auth/verify-email` endpoint handles the request
- Validates the token
- Updates `emailVerified` to `true` in the database
- Redirects to the `callbackURL` (your profile page)

## Environment Variables Required

Make sure these are in `apps/server/.env`:

```env
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
MAILERSEND_API_KEY=your_new_key_here
MAILERSEND_FROM_EMAIL=sandbox@mailersend.net
```

## Testing

1. **Start your server:**

   ```bash
   npm run dev
   ```

2. **Go to profile page:**

   ```
   http://localhost:3001/profile
   ```

3. **Click "Verify Email" button**

4. **Check your email** (or MailerSend dashboard for sandbox emails)

5. **Click the verification link**

6. **You should be redirected back to profile with `?verified=true`**

## Advantages of Better-Auth Method

✅ **Security**: Better-auth handles token generation securely
✅ **Maintenance**: No custom code to maintain
✅ **Standards**: Follows OAuth/OIDC best practices
✅ **Features**: Built-in rate limiting, token expiration, etc.
✅ **Database**: Uses better-auth's own verification tables (no custom fields needed)

## Troubleshooting

### Error: "Failed to send verification email"

**Check:**

1. Is your MailerSend API key valid and not revoked?
2. Are environment variables loaded correctly?
3. Check server console for detailed error messages

**Debug:**

```bash
# Check if better-auth endpoint is accessible
curl -X POST http://localhost:3000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Email not received

**Check:**

1. MailerSend dashboard for delivery status
2. Spam folder
3. For sandbox emails, they only go to verified recipients

### Verification link doesn't work

**Check:**

1. `BETTER_AUTH_URL` matches your actual server URL
2. Token hasn't expired (default: 24 hours)
3. Server logs for errors

## Profile Completion

Once email is verified, the profile completion calculation will automatically update:

```typescript
if (userProfile.emailVerified) completedFields++; // This will now be true!
```

Your profile completion percentage will increase by ~11% (1 out of 9 fields).

## Next Steps

1. **Revoke the exposed MailerSend API key** (see SECURITY_FIX_URGENT.md)
2. **Generate a new API key**
3. **Update `apps/server/.env` with the new key**
4. **Restart your server**
5. **Test email verification**

## API Reference

### Better-Auth Endpoints (handled automatically)

- `POST /api/auth/send-verification-email` - Send verification email
- `GET /api/auth/verify-email?token=xxx` - Verify email with token
- `POST /api/auth/resend-verification-email` - Resend verification email

### Your TRPC Endpoint

- `trpc.user.sendVerificationEmail.mutate()` - Trigger verification email send

## Custom Email Template

The email template is defined in `packages/auth/src/index.ts`:

```typescript
emailVerification: {
  sendOnSignUp: false,
  sendVerificationEmail: async ({ user, url }) => {
    // Your custom MailerSend logic here
    // 'url' is provided by better-auth and includes the token
  },
}
```

You can customize the HTML/CSS as needed!

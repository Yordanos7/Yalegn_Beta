# 🚀 Get Your Resend API Key (2 minutes)

## Step-by-Step

### 1. Sign Up

Go to: **https://resend.com/signup**

- Use your email or GitHub account
- No credit card required
- Free tier: 3,000 emails/month

### 2. Create API Key

After signing up:

1. Click **"API Keys"** in the left sidebar
2. Click **"Create API Key"** button
3. Name it: `My Better T App` (or any name)
4. Click **"Add"**
5. **Copy the key** (starts with `re_`)
   - ⚠️ You can only see it once!
   - Save it somewhere safe

### 3. Update Your .env File

Open `my-better-t-app/apps/server/.env` and add:

```env
RESEND_API_KEY=re_YOUR_KEY_HERE
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Replace `re_YOUR_KEY_HERE` with your actual key.

### 4. Restart Server

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### 5. Test It!

1. Go to http://localhost:3001/profile
2. Click "Send Verification Email"
3. Check your email
4. Click the link
5. Done! ✅

---

## 🎯 Quick Test

After setup, test with curl:

```bash
curl -X POST http://localhost:3000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","callbackURL":"http://localhost:3001/profile?verified=true"}'
```

---

## 🔍 Verify It's Working

### Check Server Logs

You should see:

```
✅ Verification email sent successfully to: user@example.com
```

### Check Resend Dashboard

1. Go to https://resend.com/emails
2. See your sent email
3. Check delivery status

---

## 🆘 Troubleshooting

### "Invalid API key"

- Make sure key starts with `re_`
- No quotes around the key in .env
- Restart server after updating .env

### "Email not received"

- Check spam folder
- Verify email address is correct
- Check Resend dashboard for errors

### "401 Unauthenticated"

- API key is wrong or missing
- Check `.env` file location
- Restart server

---

## 📝 Example .env File

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/my-better-t-app
BETTER_AUTH_SECRET=pG0uo6RSTBIcFA4MVu2qVgJqlTA3xRrF
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001

# Resend Configuration
RESEND_API_KEY=re_abc123def456ghi789jkl012mno345pqr678
RESEND_FROM_EMAIL=onboarding@resend.dev

ALPHA_VANTAGE_API_KEY=h8BeFuFfyj_jAXLjRZQqNOlHQJ8lQmFI
```

---

## ✅ That's It!

Total time: **2 minutes**
Cost: **Free** (3,000 emails/month)

Your email verification is now working! 🎉

For production deployment, see: `RESEND_EMAIL_SETUP.md`

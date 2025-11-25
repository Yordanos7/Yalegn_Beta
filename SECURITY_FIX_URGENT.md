# 🚨 URGENT SECURITY FIX - API Key Exposed on GitHub

## ⚠️ IMMEDIATE ACTIONS (Do these NOW!)

### Step 1: Revoke the Exposed API Key

1. Go to [MailerSend Dashboard](https://app.mailersend.com/)
2. Navigate to Settings → API Tokens
3. Find and **DELETE** this key: `mlsn.049d9e526d72ca7a01c402bf6a3b91b231d72b8cef0036dc0c462ca3d4abfa4a`
4. Generate a new API key
5. Copy the new key (you'll need it in Step 3)

### Step 2: Remove the Secret from Git History

The file `apps/server/.env` was committed to GitHub. You need to remove it from history:

```bash
cd my-better-t-app

# Remove the file from Git tracking (but keep it locally)
git rm --cached apps/server/.env

# Commit this change
git commit -m "Remove .env file from tracking"

# Push to GitHub
git push origin main
```

**IMPORTANT:** This only removes it from future commits. The secret is still in your Git history!

### Step 3: Clean Git History (Advanced)

To completely remove the secret from Git history, you need to use BFG Repo-Cleaner or git-filter-repo:

#### Option A: Using BFG Repo-Cleaner (Recommended)

```bash
# Install BFG (if not installed)
# On macOS: brew install bfg
# On Linux: download from https://rtyley.github.io/bfg-repo-cleaner/

# Backup your repo first!
cd ..
cp -r my-better-t-app my-better-t-app-backup

# Clean the history
cd my-better-t-app
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history!)
git push origin --force --all
```

#### Option B: Contact GitHub Support

If you're not comfortable with the above, you can:

1. Go to the GitHub repository link in the email
2. Click "Settings" → "Security" → "Secret scanning alerts"
3. Follow GitHub's recommendations

### Step 4: Update Your .env File with New Key

```bash
# Edit apps/server/.env
nano apps/server/.env
```

Replace the old key with your new MailerSend API key:

```
MAILERSEND_API_KEY="your_new_key_here"
MAILERSEND_FROM_EMAIL="sandbox@mailersend.net"
```

### Step 5: Verify .gitignore is Working

```bash
# Check that .env files are ignored
git status

# You should NOT see apps/server/.env in the list
# If you do, make sure it's in .gitignore
```

### Step 6: Add .env.example (Safe Template)

Create a safe template file that CAN be committed:

```bash
# Create example file
cat > apps/server/.env.example << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001

MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=your_email@domain.com
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
EOF

# Commit the example file
git add apps/server/.env.example
git commit -m "Add .env.example template"
git push
```

## 🔒 Prevention for Future

### 1. Always Check Before Committing

```bash
# Before committing, always check:
git status
git diff --cached

# Make sure no .env files are included!
```

### 2. Use Pre-commit Hooks

Install git-secrets to prevent committing secrets:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or download from: https://github.com/awslabs/git-secrets

# Set it up in your repo
cd my-better-t-app
git secrets --install
git secrets --register-aws
git secrets --add 'mlsn\.[a-zA-Z0-9]+'  # MailerSend pattern
```

### 3. Use Environment Variable Management

Consider using:

- **Doppler** - https://doppler.com
- **Infisical** - https://infisical.com
- **AWS Secrets Manager** (for production)

## ✅ Verification Checklist

- [ ] Revoked the exposed MailerSend API key
- [ ] Generated a new API key
- [ ] Removed .env from Git tracking
- [ ] Updated local .env with new key
- [ ] Cleaned Git history (optional but recommended)
- [ ] Force pushed to GitHub (if cleaned history)
- [ ] Created .env.example template
- [ ] Verified .gitignore is working
- [ ] Tested that email verification still works

## 📝 What Happened?

The file `apps/server/.env` containing your MailerSend API key was committed to your GitHub repository. GitHub's secret scanning detected this and notified MailerSend, who then emailed you.

**Why is this dangerous?**

- Anyone with access to your GitHub repo can see the key
- They could use your MailerSend account to send spam
- This could result in your account being suspended
- You could be charged for unauthorized usage

## 🆘 Need Help?

If you're stuck or unsure about any step, it's better to:

1. Revoke the key immediately (Step 1)
2. Generate a new key
3. Update your local .env
4. Ask for help with the Git history cleanup

The most important thing is that the exposed key is revoked!

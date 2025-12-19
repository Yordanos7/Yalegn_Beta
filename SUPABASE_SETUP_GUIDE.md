# Supabase Database Setup Guide

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the details:
   - **Organization**: Select or create one
   - **Project Name**: `my-better-t-app` (or your preferred name)
   - **Database Password**: Create a strong password and **SAVE IT**
   - **Region**: Choose the closest region to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be ready

## Step 2: Get Your Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Create the Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the `supabase-schema.sql` file from your project root
4. Copy ALL the content from that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. Wait for it to complete (should take 10-30 seconds)
8. You should see "Success. No rows returned" message

## Step 4: Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see all these tables:
   - user
   - session
   - account
   - profiles
   - skills
   - profile_skills
   - listings
   - orders
   - jobs
   - proposals
   - contracts
   - milestones
   - wallets
   - transactions
   - coin_purchases
   - conversations
   - messages
   - reviews
   - portfolio
   - notifications
   - admin_notes
   - verifications
   - disputes

## Step 5: Update Your Environment Variables

### For Backend (apps/server/.env)

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

### For Frontend (apps/web/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To get the Supabase URL and Anon Key:

1. Go to **Settings** → **API**
2. Copy **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Test the Connection

Run this command in your project root:

```bash
cd apps/server
npm run db:test
```

Or manually test with:

```bash
npx prisma db pull
```

If successful, you should see your schema being pulled.

## Step 7: Enable Row Level Security (RLS) - Optional but Recommended

For production, you should enable RLS on your tables:

1. Go to **Authentication** → **Policies**
2. For each table, click **"Enable RLS"**
3. Add policies based on your security requirements

Example policy for the `user` table:

```sql
-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON "user"
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON "user"
  FOR UPDATE
  USING (auth.uid() = id);
```

## Troubleshooting

### Error: "relation already exists"

- This means tables are already created. You can either:
  - Drop all tables and run the script again
  - Or skip this error if tables are correct

### Error: "type already exists"

- Same as above, enums are already created

### Connection refused

- Check your DATABASE_URL is correct
- Verify your database password
- Make sure your IP is not blocked (Supabase allows all IPs by default)

### Prisma can't connect

- Make sure you're using the correct connection string format
- Add `?pgbouncer=true` to the end if using connection pooling
- For direct connection, use port 5432
- For pooled connection, use port 6543

## Next Steps

After your database is set up:

1. ✅ Database tables created in Supabase
2. ✅ Environment variables configured
3. 🔄 Deploy your backend to Render
4. 🔄 Deploy your frontend to Vercel/Netlify
5. 🔄 Test the full application

## Important Notes

- **Backup your database password** - you'll need it for deployments
- **Don't commit** your `.env` files with real credentials
- **Use environment variables** in your deployment platforms
- **Enable RLS** before going to production
- **Set up database backups** in Supabase settings

## Database Schema Overview

Your app has these main entities:

- **Users & Auth**: user, session, account, verifications
- **Profiles**: profiles, skills, profile_skills, portfolio
- **Marketplace**: listings, orders, reviews
- **Jobs**: jobs, proposals, contracts, milestones
- **Payments**: wallets, transactions, coin_purchases
- **Communication**: conversations, messages, notifications
- **Admin**: admin_notes, disputes

All tables are properly indexed and have foreign key relationships set up exactly as in your Prisma schema.

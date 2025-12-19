# Complete Deployment Guide: Render + Supabase

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `my-better-t-app-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

### 1.2 Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** → **URI**
3. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password

### 1.3 Configure Database Access

1. Go to **Settings** → **Database** → **Connection pooling**
2. Enable connection pooling (recommended for production)
3. Note the pooled connection string for later use

## 🚀 Step 2: Backend Deployment (Render)

### 2.1 Prepare Backend for Deployment

First, let's create the necessary deployment files:

### 2.2 Deploy Backend to Render

1. **Push your code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**:

   - Go to [render.com](https://render.com) and sign up
   - Connect your GitHub account

3. **Deploy Backend Service**:

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `my-better-t-app-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm ci && npm run build --workspace=server`
     - **Start Command**: `npm run start --workspace=server`
     - **Instance Type**: `Starter` (free tier)

4. **Set Environment Variables** in Render dashboard:

   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[Your Supabase connection string]
   BETTER_AUTH_SECRET=[Generate a random 32+ character string]
   BETTER_AUTH_URL=https://[your-backend-service].onrender.com
   CORS_ORIGIN=https://[your-frontend-service].onrender.com
   ```

5. **Deploy**: Click "Create Web Service"

## 🌐 Step 3: Frontend Deployment (Render)

### 3.1 Deploy Frontend to Render

1. **Create Another Web Service**:

   - Click "New +" → "Web Service"
   - Connect the same GitHub repository
   - Configure the service:
     - **Name**: `my-better-t-app-frontend`
     - **Environment**: `Node`
     - **Build Command**: `npm ci && npm run build --workspace=web`
     - **Start Command**: `npm run start --workspace=web`
     - **Instance Type**: `Starter` (free tier)

2. **Set Environment Variables** for frontend:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://[your-backend-service].onrender.com
   NEXT_PUBLIC_APP_URL=https://[your-frontend-service].onrender.com
   ```

3. **Deploy**: Click "Create Web Service"

## 🗃️ Step 4: Database Migration

### 4.1 Run Prisma Migrations

After both services are deployed, you need to set up your database schema:

1. **Connect to your backend service** via Render Shell:

   - Go to your backend service in Render dashboard
   - Click "Shell" tab
   - Run the following commands:

   ```bash
   # Generate Prisma client
   npx prisma generate --schema=./packages/db/prisma/schema/schema.prisma

   # Push database schema to Supabase
   npx prisma db push --schema=./packages/db/prisma/schema/schema.prisma
   ```

2. **Verify Database Setup**:
   - Go to your Supabase dashboard
   - Check the "Table Editor" to see if all tables were created

## 🔧 Step 5: Configuration Updates

### 5.1 Update CORS Origins

After getting your actual Render URLs, update the environment variables:

1. **Backend Service** - Update `CORS_ORIGIN`:

   ```
   CORS_ORIGIN=https://[your-actual-frontend-url].onrender.com
   ```

2. **Frontend Service** - Update API URL:
   ```
   NEXT_PUBLIC_API_URL=https://[your-actual-backend-url].onrender.com
   ```

### 5.2 Update Authentication URLs

Update `BETTER_AUTH_URL` in your backend service:

```
BETTER_AUTH_URL=https://[your-actual-backend-url].onrender.com
```

## 📋 Step 6: Verification Checklist

### 6.1 Test Your Deployment

1. **Backend Health Check**:

   - Visit: `https://[your-backend-url].onrender.com`
   - Should return "OK"

2. **Frontend Access**:

   - Visit: `https://[your-frontend-url].onrender.com`
   - Should load your application

3. **Database Connection**:

   - Try registering a new user
   - Check if data appears in Supabase dashboard

4. **API Communication**:
   - Test login/logout functionality
   - Verify tRPC endpoints are working

### 6.2 Common Issues & Solutions

**Issue**: "Database connection failed"

- **Solution**: Double-check your `DATABASE_URL` in Render environment variables

**Issue**: "CORS errors"

- **Solution**: Ensure `CORS_ORIGIN` matches your frontend URL exactly

**Issue**: "Authentication not working"

- **Solution**: Verify `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` are set correctly

**Issue**: "Build fails"

- **Solution**: Check build logs in Render dashboard, ensure all dependencies are in package.json

## 🚀 Step 7: Optional Enhancements

### 7.1 Custom Domain (Optional)

1. **Purchase a domain** from any registrar
2. **In Render dashboard**:
   - Go to your service → Settings → Custom Domains
   - Add your domain
   - Follow DNS configuration instructions

### 7.2 SSL Certificate

- Render automatically provides SSL certificates for all deployments
- Your apps will be accessible via HTTPS

### 7.3 Environment-Specific Configurations

Create different environment files for staging/production:

- `.env.staging`
- `.env.production`

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Render Monitoring

- Monitor your services in Render dashboard
- Check logs for any errors
- Set up alerts for service downtime

### 8.2 Supabase Monitoring

- Monitor database performance in Supabase dashboard
- Check query performance
- Monitor storage usage

### 8.3 Regular Updates

```bash
# Update dependencies
npm update

# Update Prisma schema if needed
npx prisma db push --schema=./packages/db/prisma/schema/schema.prisma

# Redeploy services
git add .
git commit -m "Update dependencies"
git push origin main
```

## 🎉 Deployment Complete!

Your full-stack application is now deployed with:

- ✅ Frontend on Render
- ✅ Backend API on Render
- ✅ PostgreSQL database on Supabase
- ✅ Authentication system
- ✅ File uploads
- ✅ Real-time features (Socket.io)

**Your app URLs**:

- Frontend: `https://[your-frontend-service].onrender.com`
- Backend API: `https://[your-backend-service].onrender.com`
- Database: Managed by Supabase

## 💡 Pro Tips

1. **Free Tier Limitations**:

   - Render free tier services sleep after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - Consider upgrading to paid tier for production use

2. **Database Backups**:

   - Supabase automatically backs up your database
   - You can also create manual backups in the dashboard

3. **Performance Optimization**:

   - Enable connection pooling in Supabase
   - Use CDN for static assets
   - Implement caching strategies

4. **Security**:
   - Regularly rotate your `BETTER_AUTH_SECRET`
   - Monitor Supabase access logs
   - Use environment variables for all secrets

# 🚀 Quick Deployment Checklist

## Pre-Deployment Setup

- [ ] Code pushed to GitHub repository
- [ ] All environment variables documented
- [ ] Database schema finalized
- [ ] Build process tested locally

## 1. Database Setup (Supabase)

- [ ] Create Supabase account
- [ ] Create new project
- [ ] Copy database connection string
- [ ] Enable connection pooling (optional)

## 2. Backend Deployment (Render)

- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create web service for backend
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=[Supabase URL]`
  - [ ] `BETTER_AUTH_SECRET=[Random string]`
  - [ ] `BETTER_AUTH_URL=[Backend URL]`
  - [ ] `CORS_ORIGIN=[Frontend URL]`
- [ ] Deploy service
- [ ] Verify health check endpoint

## 3. Frontend Deployment (Render)

- [ ] Create web service for frontend
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_API_URL=[Backend URL]`
  - [ ] `NEXT_PUBLIC_APP_URL=[Frontend URL]`
- [ ] Deploy service
- [ ] Verify frontend loads

## 4. Database Migration

- [ ] Access backend service shell in Render
- [ ] Run: `npx prisma generate --schema=./packages/db/prisma/schema/schema.prisma`
- [ ] Run: `npx prisma db push --schema=./packages/db/prisma/schema/schema.prisma`
- [ ] Verify tables created in Supabase

## 5. Final Configuration

- [ ] Update CORS_ORIGIN with actual frontend URL
- [ ] Update BETTER_AUTH_URL with actual backend URL
- [ ] Update NEXT_PUBLIC_API_URL with actual backend URL
- [ ] Redeploy both services

## 6. Testing

- [ ] Frontend loads without errors
- [ ] Backend health check returns "OK"
- [ ] User registration works
- [ ] User login works
- [ ] Database queries work
- [ ] File uploads work (if applicable)
- [ ] Real-time features work (Socket.io)

## 7. Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure monitoring/alerts
- [ ] Set up CI/CD pipeline
- [ ] Configure backup strategy

## Environment Variables Reference

### Backend (.env)

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
BETTER_AUTH_SECRET=[32+ character random string]
BETTER_AUTH_URL=https://[backend-service].onrender.com
CORS_ORIGIN=https://[frontend-service].onrender.com
```

### Frontend (.env)

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[backend-service].onrender.com
NEXT_PUBLIC_APP_URL=https://[frontend-service].onrender.com
```

## Useful Commands

```bash
# Local setup
npm run scripts/deploy-setup.sh

# Database migration (in Render shell)
npm run scripts/db-migrate.sh

# Check service status
curl https://[backend-service].onrender.com

# View logs
# Use Render dashboard → Service → Logs
```

## Troubleshooting

| Issue                     | Solution                                           |
| ------------------------- | -------------------------------------------------- |
| Build fails               | Check package.json dependencies, review build logs |
| Database connection fails | Verify DATABASE_URL format and credentials         |
| CORS errors               | Ensure CORS_ORIGIN matches frontend URL exactly    |
| Auth not working          | Check BETTER_AUTH_SECRET and BETTER_AUTH_URL       |
| Service won't start       | Check start command and PORT environment variable  |

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

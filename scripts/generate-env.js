#!/usr/bin/env node

// Generate environment variables for deployment
import crypto from "crypto";

console.log("🔐 Generating environment variables for deployment...\n");

// Generate a secure secret for BETTER_AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString("hex");

console.log("📋 Copy these environment variables to your Render services:\n");

console.log("=== BACKEND SERVICE ENVIRONMENT VARIABLES ===");
console.log(`NODE_ENV=production`);
console.log(`PORT=3000`);
console.log(
  `DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
);
console.log(`BETTER_AUTH_SECRET=${authSecret}`);
console.log(`BETTER_AUTH_URL=https://[your-backend-service].onrender.com`);
console.log(`CORS_ORIGIN=https://[your-frontend-service].onrender.com`);

console.log("\n=== FRONTEND SERVICE ENVIRONMENT VARIABLES ===");
console.log(`NODE_ENV=production`);
console.log(`NEXT_PUBLIC_API_URL=https://[your-backend-service].onrender.com`);
console.log(`NEXT_PUBLIC_APP_URL=https://[your-frontend-service].onrender.com`);

console.log("\n📝 Notes:");
console.log("1. Replace [YOUR-PASSWORD] with your Supabase database password");
console.log("2. Replace [PROJECT-REF] with your Supabase project reference");
console.log(
  "3. Replace [your-backend-service] with your actual Render backend service name"
);
console.log(
  "4. Replace [your-frontend-service] with your actual Render frontend service name"
);
console.log(
  "5. Keep the BETTER_AUTH_SECRET secure and never share it publicly"
);

console.log("\n🔗 Useful Links:");
console.log("- Supabase Dashboard: https://supabase.com/dashboard");
console.log("- Render Dashboard: https://dashboard.render.com");
console.log("- Deployment Guide: ./DEPLOYMENT_GUIDE.md");
console.log("- Deployment Checklist: ./DEPLOYMENT_CHECKLIST.md");

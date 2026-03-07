# Deployment Guide

## Environment Variables Setup

To fix the NextAuth session error, you need to configure the following environment variables in your Vercel dashboard:

### Required Variables

1. **NEXTAUTH_SECRET** (Critical)
   - Generate with: `openssl rand -base64 32`
   - Or use an online generator: https://generate-secret.vercel.app/32
   - This MUST be set for NextAuth to work in production

2. **NEXTAUTH_URL**
   - Set to: `https://ridercomplex.com`
   - This tells NextAuth the base URL of your application

3. **APP_URL** (Recommended)
   - Set to: `https://ridercomplex.com`
   - Used for metadata and API calls

4. **MONGODB_URI**
   - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

4. **CLOUDINARY_CLOUD_NAME** (Required for image uploads)
   - Your Cloudinary cloud name
   - Get from: https://cloudinary.com/console

5. **CLOUDINARY_API_KEY** (Required for image uploads)
   - Your Cloudinary API key
   - Get from: https://cloudinary.com/console

6. **CLOUDINARY_API_SECRET** (Required for image uploads)
   - Your Cloudinary API secret
   - Get from: https://cloudinary.com/console

7. **ADMIN_EMAIL** (Optional - for fallback auth)
   - Your admin email address

8. **ADMIN_PASSWORD** (Optional - for fallback auth)
   - Your admin password

### How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (rideanddeliver1)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `NEXTAUTH_SECRET`
   - Value: `[your-generated-secret]`
   - Environments: Check all (Production, Preview, Development)
5. Click "Save"
6. Repeat for `NEXTAUTH_URL` and other variables
7. **Redeploy** your application for changes to take effect

### Quick Setup Commands

```bash
# Generate a secure secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Troubleshooting

If you still see the 500 error after adding environment variables:
1. Make sure you clicked "Save" for each variable
2. Trigger a new deployment (push a commit or manually redeploy)
3. Check Vercel logs for specific error messages
4. Verify all required variables are set for Production environment

### Current Error

The error you're seeing:
```
[next-auth][error][CLIENT_FETCH_ERROR] There is a problem with the server configuration
```

This typically means `NEXTAUTH_SECRET` or `NEXTAUTH_URL` is missing in production.

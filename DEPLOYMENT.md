# 🚀 Deployment Guide

This guide will help you deploy both the frontend and backend of your Task Manager application.

## 📋 Prerequisites

- GitHub account
- Railway account (for backend) - [railway.app](https://railway.app)
- Vercel account (for frontend) - [vercel.com](https://vercel.com)

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Your Repository
1. Commit all changes to your GitHub repository
2. Make sure your `server` folder contains all necessary files

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `Task-Manager` repository
4. Railway will automatically detect your Node.js backend

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:
```
JWT_SECRET=your-super-secret-jwt-key-for-production-change-this
NODE_ENV=production
```

### Step 4: Configure Root Directory
1. In Railway dashboard, go to Settings
2. Set "Root Directory" to `server`
3. Set "Start Command" to `npm start`

### Step 5: Get Your Backend URL
- After deployment, Railway will provide a URL like: `https://your-app-name.railway.app`
- Copy this URL for frontend configuration

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
1. Update `.env.production` file with your Railway backend URL:
```env
VITE_API_URL=https://your-app-name.railway.app/api
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project" → Import your GitHub repository
3. Vercel will automatically detect it's a Vite project

### Step 3: Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:
```
VITE_API_URL = https://your-app-name.railway.app/api
```

### Step 4: Configure Build Settings
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 5: Update CORS Settings
After frontend deployment, update your backend's CORS configuration:

1. Go back to Railway dashboard
2. Add environment variable:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

3. The server will automatically use this for CORS

## 🔄 Alternative Deployment Methods

### Using Render (Alternative to Railway)
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set root directory to `server`
5. Configure same environment variables

### Using Netlify (Alternative to Vercel)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder after running `npm run build`
3. Configure environment variables in site settings

## 🧪 Testing Your Deployment

### Backend Testing
Test your Railway backend:
```bash
curl https://your-app-name.railway.app/api/health
```

### Frontend Testing
1. Visit your Vercel URL
2. Try to register/login
3. Create a task with reminder
4. Test all features

## 🐛 Common Issues & Solutions

### CORS Errors
- Make sure backend CORS is configured with your frontend URL
- Check environment variables are set correctly

### Database Issues
- SQLite works differently in production
- Database is created in `/tmp` directory on Railway
- Data will reset on each deployment (consider upgrading to PostgreSQL for persistence)

### Build Failures
- Check all dependencies are in `package.json`
- Ensure environment variables are set
- Check build logs for specific errors

## 🔒 Security Considerations

### Backend Security
- Change JWT_SECRET to a strong, random value
- Enable rate limiting for API endpoints
- Use HTTPS only in production

### Frontend Security
- Don't expose sensitive API keys in frontend code
- Use environment variables for all configuration
- Enable CSP headers

## 📈 Performance Optimization

### Backend
- Enable gzip compression
- Add caching headers
- Monitor database performance

### Frontend
- Optimize images and assets
- Enable Vercel's automatic optimizations
- Use lazy loading for components

## 🔄 Continuous Deployment

### Automatic Deployments
Both Railway and Vercel support automatic deployments:
- Push to `main` branch → Automatic backend deployment
- Push to `main` branch → Automatic frontend deployment

### Environment-based Deployments
- Use different branches for staging/production
- Configure different environment variables per environment

## 📞 Support

If you encounter issues:
1. Check deployment logs in Railway/Vercel dashboard
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check browser console for frontend errors

---

🎉 **Congratulations!** Your Task Manager is now live and accessible worldwide!

Backend: `https://your-app-name.railway.app`
Frontend: `https://your-app-name.vercel.app`

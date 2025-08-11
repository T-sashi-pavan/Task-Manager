#!/bin/bash

# 🚀 Quick Deployment Script for Task Manager

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Task Manager Deployment Helper${NC}"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Project ready for deployment!${NC}"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. 🔧 Backend (Railway):"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'server'"
echo "   - Add environment variables:"
echo "     JWT_SECRET=your-super-secret-jwt-key"
echo "     NODE_ENV=production"
echo ""
echo "2. 🌐 Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variable:"
echo "     VITE_API_URL=https://your-backend.railway.app/api"
echo ""
echo "3. 🔄 Update CORS:"
echo "   - After frontend deployment, add to Railway:"
echo "     FRONTEND_URL=https://your-app.vercel.app"
echo ""
echo -e "${BLUE}📖 Read DEPLOYMENT.md for detailed instructions${NC}"

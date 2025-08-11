#!/bin/bash

# 🔥 Render.com Deployment Script
# FREE alternative to Railway

echo "🔥 Deploying to Render.com (FREE)"
echo "=================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Preparing for Render deployment...${NC}"

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found${NC}"
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

# Build frontend to test
echo -e "${BLUE}🔨 Testing frontend build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Test server dependencies
echo -e "${BLUE}📦 Checking server dependencies...${NC}"
cd server
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
else
    echo -e "${RED}❌ Server dependency installation failed${NC}"
    exit 1
fi

cd ..

# Commit everything
echo -e "${BLUE}📤 Committing changes...${NC}"
git add .
git commit -m "🔥 Ready for Render.com deployment - FREE Railway alternative"
git push

echo ""
echo -e "${GREEN}🎉 Project ready for Render deployment!${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo "=============="
echo ""
echo "1. 🌐 Go to: https://render.com"
echo "2. 🔐 Sign up with GitHub"
echo "3. ➕ Create 'New Web Service'"
echo "4. 🔗 Connect your GitHub repository: 'Task-Manager'"
echo "5. ⚙️  Configure settings:"
echo "   📂 Root Directory: server"
echo "   🔨 Build Command: npm install"
echo "   ▶️  Start Command: npm start"
echo "   🌍 Environment: Node"
echo ""
echo "6. 🔑 Add Environment Variables:"
echo "   JWT_SECRET=your-super-secret-jwt-key-change-this"
echo "   NODE_ENV=production"
echo ""
echo "7. 🚀 Click 'Create Web Service'"
echo ""
echo -e "${GREEN}💡 After backend deploys:${NC}"
echo "8. 📝 Update .env.production with your Render URL"
echo "9. 🌐 Deploy frontend to Vercel"
echo "10. 🎉 Your app is live!"
echo ""
echo -e "${BLUE}📖 Read FREE-DEPLOYMENT.md for detailed guide${NC}"
echo ""
echo -e "${GREEN}🔥 Render.com is COMPLETELY FREE with database included!${NC}"

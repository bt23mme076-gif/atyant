#!/bin/bash
# Quick Docker Deployment Script
# Copy this file to VPS and run: bash quick-deploy.sh

echo "=================================="
echo "🚀 Atyant Backend Deployment"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}Step 1/6: Pulling latest code...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code pulled successfully${NC}"
else
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi
echo ""

# Step 2: Stop containers
echo -e "${YELLOW}Step 2/6: Stopping containers...${NC}"
docker-compose down
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 3: Build fresh image
echo -e "${YELLOW}Step 3/6: Building fresh Docker image (this may take 2-3 minutes)...${NC}"
docker-compose build --no-cache
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Start containers
echo -e "${YELLOW}Step 4/6: Starting containers...${NC}"
docker-compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers started${NC}"
else
    echo -e "${RED}❌ Start failed${NC}"
    exit 1
fi
echo ""

# Step 5: Wait for startup
echo -e "${YELLOW}Step 5/6: Waiting for backend to start...${NC}"
sleep 8
echo -e "${GREEN}✅ Backend should be ready${NC}"
echo ""

# Step 6: Verify deployment
echo -e "${YELLOW}Step 6/6: Verifying deployment...${NC}"
echo ""

# Check if container is running
if docker ps | grep -q "atyant-backend"; then
    echo -e "${GREEN}✅ Container is running${NC}"
else
    echo -e "${RED}❌ Container is not running${NC}"
    echo "Showing logs:"
    docker-compose logs --tail=20 backend
    exit 1
fi

# Check for CORS configuration in logs
echo ""
echo "Checking CORS configuration..."
if docker-compose logs backend | grep -q "CORS Allowed Origins"; then
    echo -e "${GREEN}✅ CORS configured correctly:${NC}"
    docker-compose logs backend | grep "CORS Allowed Origins"
else
    echo -e "${RED}⚠️  CORS line not found in logs${NC}"
    echo "Showing recent logs:"
    docker-compose logs --tail=30 backend
fi

# Test health endpoint
echo ""
echo "Testing health endpoint..."
HEALTH_CHECK=$(curl -s http://localhost:5000/api/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
    echo "Response: $HEALTH_CHECK"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Next Steps:"
echo "1. Go to https://www.atyant.in"
echo "2. Try Google login"
echo "3. Check browser console for errors"
echo ""
echo "🔍 To view live logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "🔄 To restart backend:"
echo "   docker-compose restart backend"
echo ""

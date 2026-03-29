#!/bin/bash

# 🚀 Docker Deployment Script for VPS
# Run this on your VPS to deploy latest code

echo "🔄 Starting deployment..."

# Step 1: Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Check your git configuration."
    exit 1
fi

# Step 2: Stop running containers
echo "🛑 Stopping Docker containers..."
docker-compose down

# Step 3: Remove old images (optional but recommended)
echo "🗑️  Removing old Docker images..."
docker image prune -f

# Step 4: Build fresh Docker image (no cache)
echo "🔨 Building fresh Docker image..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed! Check Dockerfile and dependencies."
    exit 1
fi

# Step 5: Start containers
echo "🚀 Starting Docker containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Docker start failed!"
    exit 1
fi

# Step 6: Wait for container to be healthy
echo "⏳ Waiting for backend to start..."
sleep 10

# Step 7: Check logs
echo "📋 Checking backend logs..."
docker-compose logs --tail=50 backend

# Step 8: Verify CORS configuration
echo ""
echo "🔍 Looking for CORS configuration in logs..."
docker-compose logs backend | grep "CORS Allowed Origins"

# Step 9: Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
curl -s http://localhost:5000/api/health | head -n 5

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check if CORS line appears above"
echo "2. Test login on www.atyant.in"
echo "3. If still not working, check Nginx config"
echo ""
echo "🔍 To view live logs: docker-compose logs -f backend"

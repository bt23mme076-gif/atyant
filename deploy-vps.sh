#!/bin/bash
# Quick deployment script for VPS

echo "🚀 Deploying to VPS..."

# SSH into VPS and run deployment commands
ssh your-user@your-vps-ip << 'ENDSSH'
  cd /path/to/atyant
  
  echo "📥 Pulling latest code..."
  git pull origin main
  
  echo "📦 Installing dependencies..."
  cd backend
  npm install
  
  echo "🔄 Restarting backend..."
  # Choose one based on your setup:
  # docker compose down && docker compose up -d --build
  # pm2 restart atyant-backend
  # systemctl restart atyant-backend
  
  echo "✅ Deployment complete!"
  
  echo "📊 Checking status..."
  # docker compose logs --tail=10
  # pm2 logs atyant-backend --lines 10
ENDSSH

echo "🎉 Done! Check https://api.atyant.in/api/health"

#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Ecove — Production Deploy Script
# Run on the VPS after uploading new code:  bash scripts/deploy.sh
# ═══════════════════════════════════════════════════════════
set -e

APP_DIR="/var/www/ecove"
LOG_DIR="/var/log/ecove"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Ecove — Deploying to Production  ║"
echo "╚══════════════════════════════════════╝"
echo ""

cd $APP_DIR

echo "▶ Installing dependencies..."
npm install --production=false

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Building application..."
npm run build

echo "▶ Copying static files to standalone..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "▶ Restarting application..."
pm2 reload ecosystem.config.js --env production

echo "▶ Saving PM2 process list..."
pm2 save

echo ""
echo "✅ Deploy complete!"
echo "   App running at: http://localhost:3000"
echo "   Check logs with: pm2 logs ecove"
echo ""

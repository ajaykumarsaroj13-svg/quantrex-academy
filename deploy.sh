#!/bin/bash

# Quantrex Academy Ecosystem - Auto Deployment Script
# AJAY KUMAR SAROJ (A.K. Sir) - "Where Rankers Are Engineered"

echo "=================================================="
echo "   QUANTREX ACADEMY DEPLOYMENT UTILITIES           "
echo "=================================================="

# 1. Clean previous build folders
echo "🧹 Cleaning previous build dist cache..."
rm -rf frontend/dist

# 2. Install all dependencies
echo "📦 Installing client and server dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. Compiling production bundle
echo "⚙️  Building production frontend assets..."
npm run build

# 4. Check status
if [ $? -eq 0 ]; then
  echo "✅ Compilation completed successfully! Build folder: frontend/dist"
  echo "🚀 Static assets are ready to be pushed to Vercel/GitHub Pages."
else
  echo "❌ Error during frontend compilation build. Please check esbuild logs."
  exit 1
fi

cd ..

echo "=================================================="
echo "   Ecosystem ready for production deployment!     "
echo "=================================================="

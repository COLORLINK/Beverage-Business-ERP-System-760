#!/bin/bash

# Deployment script for Hostinger

echo "🚀 Starting deployment to Hostinger..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build the project
echo "🔨 Building project for production..."
npm run build

# Step 3: Create deployment package
echo "📁 Creating deployment package..."
cd dist
zip -r ../erp-deployment.zip .
cd ..

echo "✅ Deployment package created: erp-deployment.zip"
echo ""
echo "📋 Next steps:"
echo "1. Download erp-deployment.zip"
echo "2. Extract it to your Hostinger public_html folder via File Manager"
echo "3. Upload .htaccess file to handle routing"
echo "4. Test your application"
echo ""
echo "🌐 Your app will be available at: https://yourdomain.com"
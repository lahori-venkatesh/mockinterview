#!/bin/bash

# Production Deployment Script for Mock Interview Platform (No Docker)

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
print_status "Installing server dependencies..."
cd server
npm install --production
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi

cd ..

print_status "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi

# Build client for production
print_status "Building client for production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build client"
    exit 1
fi

cd ..

print_status "Installing admin panel dependencies..."
cd admin-panel
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install admin panel dependencies"
    exit 1
fi

# Build admin panel for production
print_status "Building admin panel for production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build admin panel"
    exit 1
fi

cd ..

# Check environment variables
print_status "Checking environment configuration..."
if [ ! -f "server/.env" ]; then
    print_warning "Server .env file not found. Please create one based on .env.example"
fi

print_status "✅ Production build completed successfully!"
print_status "📦 Built files:"
print_status "   - Client: client/build/"
print_status "   - Admin Panel: admin-panel/build/"
print_status "   - Server: server/ (ready to run)"

print_warning "⚠️  Before deploying, make sure to:"
print_warning "   1. Set up production environment variables"
print_warning "   2. Configure your database connection"
print_warning "   3. Set up your domain and SSL certificates"
print_warning "   4. Configure your payment gateway (Razorpay)"

echo ""
print_status "🚀 Ready for deployment to Render, Vercel, or any hosting platform!"
print_status "📖 See PRODUCTION_SETUP.md for detailed deployment instructions"
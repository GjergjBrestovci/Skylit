#!/bin/bash

# SkyLit AI Production Deployment Script
# This script helps deploy SkyLit AI to production using Vercel and Railway

set -e

echo "🚀 SkyLit AI Production Deployment"
echo "=================================="

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if required CLIs are installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm i -g @railway/cli"
        exit 1
    fi
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Install with: npm i -g supabase"
        exit 1
    fi
    
    print_status "All prerequisites found ✓"
}

# Deploy Supabase database
deploy_database() {
    print_status "Setting up Supabase database..."
    
    cd supabase
    
    # Link to production project (you'll need to create this first)
    print_warning "Make sure you've created a Supabase project at https://supabase.com/dashboard"
    read -p "Enter your Supabase project reference: " project_ref
    
    supabase link --project-ref $project_ref
    
    # Push database schema
    print_status "Pushing database schema..."
    supabase db push
    
    cd ..
    print_status "Database setup complete ✓"
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Login to Railway (if not already logged in)
    railway login
    
    # Create or link project
    print_warning "Make sure you've created a Railway project at https://railway.app/dashboard"
    railway link
    
    # Set environment variables
    print_status "Setting environment variables..."
    print_warning "Please set the following environment variables in Railway dashboard:"
    cat .env.production
    
    read -p "Press Enter after setting environment variables in Railway dashboard..."
    
    # Deploy
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_status "Backend deployment complete ✓"
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Login to Vercel (if not already logged in)
    vercel login
    
    # Deploy to production
    print_status "Deploying to Vercel..."
    vercel --prod
    
    cd ..
    print_status "Frontend deployment complete ✓"
}

# Setup Redis cache
setup_redis() {
    print_status "Setting up Redis cache..."
    print_warning "Please create an Upstash Redis instance at https://upstash.com/"
    print_warning "Then add the Redis URL to your Railway environment variables"
    read -p "Press Enter after setting up Redis..."
    print_status "Redis setup complete ✓"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get deployment URLs
    cd frontend
    frontend_url=$(vercel ls --meta | grep skylit | head -1 | awk '{print $2}')
    cd ..
    
    cd backend
    backend_url=$(railway status --json | jq -r '.deployments[0].url')
    cd ..
    
    print_status "Deployment URLs:"
    echo "Frontend: $frontend_url"
    echo "Backend: $backend_url"
    
    print_status "Testing endpoints..."
    
    # Test backend health
    if curl -f "$backend_url/health" > /dev/null 2>&1; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed ✗"
    fi
    
    # Test frontend
    if curl -f "$frontend_url" > /dev/null 2>&1; then
        print_status "Frontend health check passed ✓"
    else
        print_error "Frontend health check failed ✗"
    fi
    
    print_status "Deployment verification complete ✓"
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-db)
                SKIP_DB=1
                shift
                ;;
            --skip-backend)
                SKIP_BACKEND=1
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=1
                shift
                ;;
            --help)
                echo "Usage: $0 [--skip-db] [--skip-backend] [--skip-frontend]"
                echo "  --skip-db: Skip database deployment"
                echo "  --skip-backend: Skip backend deployment"
                echo "  --skip-frontend: Skip frontend deployment"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    check_prerequisites
    
    if [[ -z "$SKIP_DB" ]]; then
        deploy_database
    fi
    
    setup_redis
    
    if [[ -z "$SKIP_BACKEND" ]]; then
        deploy_backend
    fi
    
    if [[ -z "$SKIP_FRONTEND" ]]; then
        deploy_frontend
    fi
    
    verify_deployment
    
    echo ""
    print_status "🎉 Deployment complete!"
    echo "Your SkyLit AI application is now live in production."
    echo ""
    echo "Next steps:"
    echo "1. Configure your custom domain"
    echo "2. Set up monitoring and alerts"
    echo "3. Configure SSL certificates"
    echo "4. Set up CI/CD pipeline"
    echo ""
    echo "For detailed instructions, see docs/DEPLOYMENT_GUIDE.md"
}

# Run main function with all arguments
main "$@"

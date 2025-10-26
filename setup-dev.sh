#!/bin/bash

# VibelyTube Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 VibelyTube Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js (v18+)")
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            missing_deps+=("Node.js v18+ (current: $(node -v))")
        fi
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if ! command_exists git; then
        missing_deps+=("Git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    print_status "All prerequisites met ✅"
}

# Setup environment variables
setup_environment() {
    print_step "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_warning "Created .env file from .env.example"
        print_warning "Please edit .env file with your actual values before continuing"
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "your-super-secure-jwt-secret-key-$(date +%s)")
        sed -i.bak "s/your-super-secure-jwt-secret-key-minimum-32-characters/$JWT_SECRET/" .env
        
        print_status "Generated JWT secret"
    else
        print_status ".env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_status "Dependencies installed ✅"
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    # Start PostgreSQL container
    print_status "Starting PostgreSQL container..."
    docker-compose up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npx prisma migrate dev --name init
    
    # Generate Prisma client
    npx prisma generate
    
    # Seed database
    print_status "Seeding database..."
    npx prisma db seed
    
    cd ..
    print_status "Database setup complete ✅"
}

# Setup Redis
setup_redis() {
    print_step "Setting up Redis cache..."
    
    docker-compose up -d redis
    print_status "Redis cache setup complete ✅"
}

# Build applications
build_applications() {
    print_step "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_status "Applications built successfully ✅"
}

# Setup monitoring
setup_monitoring() {
    print_step "Setting up monitoring stack..."
    
    docker-compose up -d prometheus grafana
    
    print_status "Monitoring stack setup complete ✅"
    print_status "Grafana available at: http://localhost:3001"
    print_status "Prometheus available at: http://localhost:9090"
}

# Create SSL certificates for development
create_ssl_certificates() {
    print_step "Creating SSL certificates for development..."
    
    mkdir -p ssl
    
    if [ ! -f "ssl/key.pem" ] || [ ! -f "ssl/cert.pem" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_status "SSL certificates created ✅"
    else
        print_status "SSL certificates already exist"
    fi
}

# Start development servers
start_dev_servers() {
    print_step "Starting development servers..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Function to cleanup on exit
    cleanup() {
        print_status "Shutting down development servers..."
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        exit 0
    }
    
    trap cleanup INT TERM
    
    print_status "Development servers started ✅"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend: http://localhost:3000"
    print_status "Press Ctrl+C to stop all servers"
    
    wait
}

# Main setup function
main() {
    echo ""
    echo "This script will set up the complete VibelyTube development environment."
    echo "It will:"
    echo "  1. Check prerequisites"
    echo "  2. Setup environment variables"
    echo "  3. Install dependencies"
    echo "  4. Setup database and Redis"
    echo "  5. Build applications"
    echo "  6. Setup monitoring"
    echo "  7. Create SSL certificates"
    echo "  8. Start development servers"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    setup_redis
    build_applications
    setup_monitoring
    create_ssl_certificates
    
    echo ""
    print_status "🎉 Setup complete!"
    echo ""
    
    read -p "Do you want to start the development servers now? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_servers
    else
        echo ""
        print_status "You can start the development servers later with:"
        echo "  npm run dev:all"
        echo ""
    fi
}

# Run main function
main "$@"
#!/bin/sh

# Docker entrypoint script for VibelyTube application
set -e

echo "🚀 Starting VibelyTube application..."

# Function to check if a service is available
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be available at $host:$port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo "✅ $service_name is available!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts: $service_name not yet available..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Failed to connect to $service_name after $max_attempts attempts"
    return 1
}

# Wait for database
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    wait_for_service "$DB_HOST" "$DB_PORT" "PostgreSQL Database"
fi

# Wait for Redis
if [ -n "$REDIS_URL" ]; then
    REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\)$/\1/p')
    if [ -z "$REDIS_PORT" ]; then
        REDIS_PORT=6379
    fi
    wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis Cache"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
cd /app/backend
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
    echo "⚠️  Migration failed, but continuing..."
}

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed || {
        echo "⚠️  Database seeding failed, but continuing..."
    }
fi

# Create necessary directories
mkdir -p /app/logs /app/uploads
chmod 755 /app/logs /app/uploads

# Function to start services with process management
start_services() {
    echo "🚀 Starting backend server..."
    cd /app/backend
    node dist/server.js &
    BACKEND_PID=$!
    
    echo "🎨 Starting frontend server..."
    cd /app/frontend
    npx serve -s dist -l ${FRONTEND_PORT:-5173} &
    FRONTEND_PID=$!
    
    # Function to handle shutdown
    shutdown() {
        echo "🛑 Shutting down services..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
        echo "✅ Services stopped gracefully"
        exit 0
    }
    
    # Set up signal handlers
    trap 'shutdown' TERM INT
    
    # Wait for processes
    wait $BACKEND_PID
    wait $FRONTEND_PID
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Performing health check..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:${PORT:-3000}/health >/dev/null 2>&1; then
            echo "✅ Application is healthy!"
            return 0
        fi
        
        echo "🔄 Health check attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Health check failed after $max_attempts attempts"
    return 1
}

# Main execution
case "${1:-start}" in
    "start")
        start_services
        ;;
    "health")
        health_check
        ;;
    "migrate")
        echo "🗄️  Running migrations only..."
        cd /app/backend
        npx prisma migrate deploy
        ;;
    "seed")
        echo "🌱 Seeding database only..."
        cd /app/backend
        npx prisma db seed
        ;;
    *)
        echo "Usage: $0 {start|health|migrate|seed}"
        echo "  start   - Start the application (default)"
        echo "  health  - Perform health check"
        echo "  migrate - Run database migrations only"
        echo "  seed    - Seed database only"
        exit 1
        ;;
esac
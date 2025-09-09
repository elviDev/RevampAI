#!/bin/bash

# Development startup script for CEO Communication Platform Backend

echo "🚀 Starting CEO Communication Platform Backend..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your database credentials and run again."
    echo "💡 Common database URLs:"
    echo "   PostgreSQL: postgresql://username:password@localhost:5433/database_name"
    echo "   For Docker: postgresql://postgres:root@localhost:5433/ceo_platform_dev"
    exit 1
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "⚠️  Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
}

# Function to check if port is open (Windows compatible)
check_port() {
    local host=$1
    local port=$2
    if command -v nc >/dev/null 2>&1; then
        nc -z $host $port 2>/dev/null
    elif command -v telnet >/dev/null 2>&1; then
        timeout 3 telnet $host $port </dev/null >/dev/null 2>&1
    else
        # Use PowerShell as fallback for Windows
        powershell -Command "(New-Object Net.Sockets.TcpClient).Connect('$host', $port)" 2>/dev/null
    fi
}

# Function to start Docker services
start_docker_services() {
    echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
    
    # Check if Docker is running
    check_docker
    
    # Start Docker services
    docker-compose -f docker/docker-compose.dev.yml up -d postgres redis
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    
    # Wait for PostgreSQL (max 30 seconds)
    echo "   Waiting for PostgreSQL..."
    for i in {1..30}; do
        if check_port localhost 5433; then
            echo "   ✅ PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "   ❌ PostgreSQL failed to start after 30 seconds"
            echo "   Debug: Checking container status..."
            docker compose -f docker/docker-compose.dev.yml ps postgres
            echo "   Debug: Recent logs..."
            docker compose -f docker/docker-compose.dev.yml logs --tail=10 postgres
            exit 1
        fi
        echo "   Attempt $i/30..."
        sleep 1
    done
    
    # Wait for Redis (max 10 seconds)
    echo "   Waiting for Redis..."
    for i in {1..10}; do
        if check_port localhost 6379; then
            echo "   ✅ Redis is ready"
            break
        fi
        if [ $i -eq 10 ]; then
            echo "   ❌ Redis failed to start after 10 seconds"
            echo "   Debug: Checking container status..."
            docker compose -f docker/docker-compose.dev.yml ps redis
            echo "   Debug: Recent logs..."
            docker compose -f docker/docker-compose.dev.yml logs --tail=10 redis
            exit 1
        fi
        echo "   Attempt $i/10..."
        sleep 1
    done
    
    echo "🎉 All Docker services are ready!"
}

# Check if PostgreSQL is running on port 5433
echo "🔍 Checking if PostgreSQL is running on port 5433..."
if ! check_port localhost 5433; then
    echo "📋 PostgreSQL not running on port 5433. Starting Docker services..."
    start_docker_services
else
    echo "✅ PostgreSQL is already running on port 5433"
fi

# Check if Redis is running
echo "🔍 Checking if Redis is running on port 6379..."
if ! check_port localhost 6379; then
    echo "📋 Redis not running on port 6379. Starting Docker services..."
    start_docker_services
else
    echo "✅ Redis is already running on port 6379"
fi

echo "📦 Installing dependencies..."
npm install

echo "🗃️  Running database migrations..."
npm run db:migrate

echo "🌱 Seeding database with test data..."
npm run db:seed

echo "🚀 Starting development server..."
npm run dev
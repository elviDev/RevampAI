@echo off
echo 🚀 Starting CEO Communication Platform Backend...

:: Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo 📝 Please update .env with your database credentials and run again.
    echo 💡 Common database URLs:
    echo    PostgreSQL: postgresql://username:password@localhost:5433/database_name
    echo    For Docker: postgresql://postgres:root@localhost:5433/ceo_platform_dev
    pause
    exit /b 1
)

:: Function to check if port is open
:check_port
powershell -Command "(New-Object Net.Sockets.TcpClient).Connect('localhost', %1)" >nul 2>&1
exit /b %errorlevel%

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

:: Check if PostgreSQL is running on port 5433
echo 🔍 Checking if PostgreSQL is running on port 5433...
call :check_port 5433
if %errorlevel% neq 0 (
    echo 📋 PostgreSQL not running. Starting Docker services...
    goto start_services
)
echo ✅ PostgreSQL is already running on port 5433

:: Check if Redis is running on port 6379
echo 🔍 Checking if Redis is running on port 6379...
call :check_port 6379
if %errorlevel% neq 0 (
    echo 📋 Redis not running. Starting Docker services...
    goto start_services
)
echo ✅ Redis is already running on port 6379

goto install_deps

:start_services
echo 🐳 Starting Docker services (PostgreSQL & Redis)...
docker-compose -f docker/docker-compose.dev.yml up -d postgres redis

echo ⏳ Waiting for services to be ready...

:: Wait for PostgreSQL (max 30 seconds)
echo    Waiting for PostgreSQL...
set /a counter=0
:wait_postgres
set /a counter+=1
call :check_port 5433
if %errorlevel% equ 0 (
    echo    ✅ PostgreSQL is ready
    goto check_redis
)
if %counter% geq 30 (
    echo    ❌ PostgreSQL failed to start after 30 seconds
    echo    Debug: Checking container status...
    docker-compose -f docker/docker-compose.dev.yml ps postgres
    echo    Debug: Recent logs...
    docker-compose -f docker/docker-compose.dev.yml logs --tail=10 postgres
    pause
    exit /b 1
)
echo    Attempt %counter%/30...
timeout /t 1 /nobreak >nul
goto wait_postgres

:check_redis
:: Wait for Redis (max 10 seconds)
echo    Waiting for Redis...
set /a counter=0
:wait_redis
set /a counter+=1
call :check_port 6379
if %errorlevel% equ 0 (
    echo    ✅ Redis is ready
    goto services_ready
)
if %counter% geq 10 (
    echo    ❌ Redis failed to start after 10 seconds
    echo    Debug: Checking container status...
    docker-compose -f docker/docker-compose.dev.yml ps redis
    echo    Debug: Recent logs...
    docker-compose -f docker/docker-compose.dev.yml logs --tail=10 redis
    pause
    exit /b 1
)
echo    Attempt %counter%/10...
timeout /t 1 /nobreak >nul
goto wait_redis

:services_ready
echo 🎉 All Docker services are ready!

:install_deps
echo 📦 Installing dependencies...
call npm install

echo 🗃️  Running database migrations...
call npm run db:migrate

echo 🌱 Seeding database with test data...
call npm run db:seed

echo 🚀 Starting development server...
call npm run dev
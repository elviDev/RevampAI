@echo off
echo ========================================
echo RevampAI - Windows Docker Setup
echo ========================================

echo.
echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop for Windows first.
    echo Download from: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

echo Docker is installed and running.
echo.

echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available!
    echo Please ensure Docker Desktop includes Docker Compose.
    pause
    exit /b 1
)

echo Docker Compose is available.
echo.

echo ========================================
echo Starting RevampAI Services
echo ========================================

echo.
echo 1. Starting Database and Redis...
docker-compose -f docker-compose.windows.yml up postgres redis -d

echo.
echo 2. Waiting for database to be ready...
timeout /t 10 >nul

echo.
echo 3. Starting Backend API...
docker-compose -f docker-compose.windows.yml up backend -d

echo.
echo 4. Starting React Native Metro Bundler...
docker-compose -f docker-compose.windows.yml up metro -d

echo.
echo ========================================
echo Services Status
echo ========================================
docker-compose -f docker-compose.windows.yml ps

echo.
echo ========================================
echo Service URLs
echo ========================================
echo Database (PostgreSQL): localhost:5432
echo Redis: localhost:6379
echo Backend API: http://localhost:3001
echo React Native Metro: http://localhost:8081
echo.

echo ========================================
echo Test Credentials (from your docs)
echo ========================================
echo CEO: alex.ceo@company.com / TempPass123!
echo Manager: sarah.manager@seeddata.com / TempPass123!
echo.

echo ========================================
echo Next Steps for Android Development
echo ========================================
echo.
echo To run Android app:
echo 1. Start Android emulator or connect device
echo 2. Run: docker-compose -f docker-compose.windows.yml run android-dev
echo 3. In the container: npx react-native run-android
echo.
echo Or run locally:
echo 1. npm install (if not done)
echo 2. npx react-native run-android
echo.

echo ========================================
echo Management Commands
echo ========================================
echo.
echo Stop all services:
echo   docker-compose -f docker-compose.windows.yml down
echo.
echo View logs:
echo   docker-compose -f docker-compose.windows.yml logs -f [service_name]
echo.
echo Restart services:
echo   docker-compose -f docker-compose.windows.yml restart
echo.

echo Setup complete! Services are running in the background.
echo.
pause

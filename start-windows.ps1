# RevampAI - Windows PowerShell Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RevampAI - Windows Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker installation
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows first." -ForegroundColor Red
    Write-Host "Download from: https://docs.docker.com/desktop/windows/install/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose is available: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker Compose is not available!" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop includes Docker Compose." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting RevampAI Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start services step by step
Write-Host ""
Write-Host "1. Starting Database and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.windows.yml up postgres redis -d

Write-Host ""
Write-Host "2. Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "3. Starting Backend API..." -ForegroundColor Yellow
docker-compose -f docker-compose.windows.yml up backend -d

Write-Host ""
Write-Host "4. Starting React Native Metro Bundler..." -ForegroundColor Yellow
docker-compose -f docker-compose.windows.yml up metro -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose -f docker-compose.windows.yml ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🗄️  Database (PostgreSQL): localhost:5432" -ForegroundColor Green
Write-Host "🔄 Redis: localhost:6379" -ForegroundColor Green
Write-Host "🚀 Backend API: http://localhost:3001" -ForegroundColor Green
Write-Host "📱 React Native Metro: http://localhost:8081" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Credentials (from your docs)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "👑 CEO: alex.ceo@company.com / TempPass123!" -ForegroundColor Magenta
Write-Host "👨‍💼 Manager: sarah.manager@seeddata.com / TempPass123!" -ForegroundColor Magenta

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps for Android Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1 - Use Docker Android Environment:" -ForegroundColor Yellow
Write-Host "  1. docker-compose -f docker-compose.windows.yml run android-dev" -ForegroundColor White
Write-Host "  2. Inside container: npx react-native run-android" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - Run locally (recommended):" -ForegroundColor Yellow
Write-Host "  1. npm install" -ForegroundColor White
Write-Host "  2. npx react-native run-android" -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Management Commands" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Stop all services:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.windows.yml down" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.windows.yml logs -f [service_name]" -ForegroundColor White
Write-Host ""
Write-Host "Restart services:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.windows.yml restart" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup complete! Services are running in the background." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"

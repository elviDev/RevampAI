@echo off
echo ========================================
echo Stopping RevampAI Services
echo ========================================

echo.
echo Stopping all containers...
docker-compose -f docker-compose.windows.yml down

echo.
echo Removing unused volumes (optional)...
echo This will preserve your database data.
echo To remove all data, run: docker-compose -f docker-compose.windows.yml down -v

echo.
echo Services stopped successfully!
echo.

echo To start again, run: start-windows.bat
echo.
pause

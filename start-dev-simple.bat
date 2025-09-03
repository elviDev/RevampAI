@echo off
echo ========================================
echo RevampAI - Simple Development Setup
echo ========================================
echo.
echo Starting only Database and Redis...
echo Backend and React Native will run locally.
echo.

docker-compose -f docker-compose.dev-only.yml up -d

echo.
echo ✅ Database and Redis are running!
echo.
echo 🗄️  PostgreSQL: localhost:5432
echo 🔄 Redis: localhost:6379
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Start Backend (in backend folder):
echo    cd backend
echo    npm install
echo    npm run dev
echo.
echo 2. Start React Native (in main folder):
echo    npm install
echo    npm start
echo.
echo 3. Run Android (in another terminal):
echo    npx react-native run-android
echo.
echo Press any key to continue...
pause

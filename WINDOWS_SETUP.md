# 🪟 RevampAI - Windows Docker Setup

This guide will help you run the complete RevampAI project on Windows using Docker containers, including the database, Redis, backend API, and React Native development environment.

## 📋 Prerequisites

### Required Software
1. **Docker Desktop for Windows**
   - Download from: https://docs.docker.com/desktop/windows/install/
   - Make sure to enable WSL 2 backend
   - Allocate at least 4GB RAM to Docker

2. **Git for Windows**
   - Download from: https://git-scm.com/download/win

3. **Node.js (Optional - for local development)**
   - Download from: https://nodejs.org/ (LTS version)
   - Only needed if you want to run React Native locally

### System Requirements
- Windows 10/11 Pro, Enterprise, or Education (64-bit)
- At least 8GB RAM (16GB recommended)
- WSL 2 enabled
- Virtualization enabled in BIOS

## 🚀 Quick Start

### Method 1: Automatic Setup (Recommended)

1. **Clone the repository:**
   ```cmd
   git clone https://github.com/elviDev/RevampAI.git
   cd RevampAI
   ```

2. **Run the setup script:**
   ```cmd
   # Using Batch file (double-click or run from cmd)
   start-windows.bat
   
   # OR using PowerShell (run as Administrator)
   PowerShell -ExecutionPolicy Bypass -File start-windows.ps1
   ```

3. **Wait for services to start** (takes 2-3 minutes on first run)

### Method 2: Manual Setup

1. **Start database and Redis:**
   ```cmd
   docker-compose -f docker-compose.windows.yml up postgres redis -d
   ```

2. **Wait for database (15 seconds), then start backend:**
   ```cmd
   docker-compose -f docker-compose.windows.yml up backend -d
   ```

3. **Start React Native Metro bundler:**
   ```cmd
   docker-compose -f docker-compose.windows.yml up metro -d
   ```

## 🔗 Service URLs

Once everything is running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| 🚀 Backend API | http://localhost:3001 | REST API & WebSocket |
| 📱 Metro Bundler | http://localhost:8081 | React Native bundler |
| 🗄️ PostgreSQL | localhost:5432 | Database |
| 🔄 Redis | localhost:6379 | Cache & Sessions |

## 🧪 Testing the Setup

### 1. Test Backend API
Open http://localhost:3001/health in your browser or:
```cmd
curl http://localhost:3001/health
```

### 2. Test Login with Verified Credentials
```cmd
curl -X POST http://localhost:3001/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"alex.ceo@company.com\",\"password\":\"TempPass123!\"}"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "0cb414a1-4ae1-43e2-9334-fc38f2f720d3",
      "email": "alex.ceo@company.com",
      "name": "Alexander Mitchell",
      "role": "ceo"
    },
    "accessToken": "[JWT_TOKEN]"
  }
}
```

## 📱 Android Development

### Option 1: Local Android Development (Recommended)

1. **Install Android Studio:**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and emulator

2. **Install project dependencies:**
   ```cmd
   npm install
   ```

3. **Start an Android emulator or connect a device**

4. **Run the React Native app:**
   ```cmd
   npx react-native run-android
   ```

### Option 2: Docker Android Environment

1. **Start the Android development container:**
   ```cmd
   docker-compose -f docker-compose.windows.yml --profile android up android-dev -d
   ```

2. **Enter the container:**
   ```cmd
   docker-compose -f docker-compose.windows.yml exec android-dev bash
   ```

3. **Inside the container, run:**
   ```bash
   npx react-native run-android
   ```

## 📊 Monitoring & Logs

### View Service Status
```cmd
docker-compose -f docker-compose.windows.yml ps
```

### View Logs
```cmd
# All services
docker-compose -f docker-compose.windows.yml logs -f

# Specific service
docker-compose -f docker-compose.windows.yml logs -f backend
docker-compose -f docker-compose.windows.yml logs -f postgres
docker-compose -f docker-compose.windows.yml logs -f metro
```

### Monitor Resource Usage
```cmd
docker stats
```

## 🛠️ Management Commands

### Stop Services
```cmd
# Stop all services
docker-compose -f docker-compose.windows.yml down

# OR use the stop script
stop-windows.bat
```

### Restart Services
```cmd
docker-compose -f docker-compose.windows.yml restart
```

### Reset Database (⚠️ Destroys all data)
```cmd
docker-compose -f docker-compose.windows.yml down -v
docker-compose -f docker-compose.windows.yml up postgres redis -d
```

### Update Containers
```cmd
docker-compose -f docker-compose.windows.yml pull
docker-compose -f docker-compose.windows.yml up -d --force-recreate
```

## 🔧 Configuration

### Environment Variables

The Docker setup uses these default environment variables:

```env
NODE_ENV=development
DATABASE_URL=postgresql://ceo_user:ceo_password@postgres:5432/ceo_platform
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
```

To customize, create a `.env` file in the backend directory.

### Database Credentials

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | ceo_platform |
| Username | ceo_user |
| Password | ceo_password |

## 🔐 Test Users

From your `VERIFIED_USER_CREDENTIALS.md`:

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| CEO | alex.ceo@company.com | TempPass123! | 0cb414a1-4ae1-43e2-9334-fc38f2f720d3 |
| Manager | sarah.manager@seeddata.com | TempPass123! | 4dfc35ff-660f-403b-bbf2-99d9ef77e541 |
| Manager | mike.manager@seeddata.com | TempPass123! | c45824a3-e1ab-4773-92e0-2c752d53aea2 |

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```cmd
   # Find process using port
   netstat -ano | findstr :3001
   # Kill process by PID
   taskkill /PID <PID> /F
   ```

2. **Docker Desktop Not Running:**
   - Start Docker Desktop application
   - Wait for it to fully initialize

3. **WSL 2 Issues:**
   - Enable WSL 2 in Windows Features
   - Update WSL kernel: `wsl --update`

4. **Memory Issues:**
   - Increase Docker Desktop memory allocation
   - Close other resource-intensive applications

5. **Database Connection Failed:**
   ```cmd
   # Check if database is healthy
   docker-compose -f docker-compose.windows.yml ps postgres
   
   # Restart database
   docker-compose -f docker-compose.windows.yml restart postgres
   ```

6. **Metro Bundler Issues:**
   ```cmd
   # Clear Metro cache
   docker-compose -f docker-compose.windows.yml exec metro npm start -- --reset-cache
   
   # Or restart Metro
   docker-compose -f docker-compose.windows.yml restart metro
   ```

### Performance Optimization

1. **Allocate more resources to Docker:**
   - Open Docker Desktop Settings
   - Go to Resources → Advanced
   - Increase CPU and Memory allocation

2. **Use SSD storage for Docker volumes**

3. **Enable Windows Performance Mode**

## 📁 Project Structure

```
RevampAI/
├── docker-compose.windows.yml    # Main Docker Compose file
├── Dockerfile.metro              # React Native Metro bundler
├── Dockerfile.android            # Android development environment
├── start-windows.bat             # Windows setup script
├── start-windows.ps1             # PowerShell setup script
├── stop-windows.bat              # Stop script
├── backend/
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   ├── Dockerfile.dev
│   │   ├── postgres/
│   │   └── redis/
│   └── src/
├── src/                          # React Native source code
├── android/                      # Android project files
└── ios/                          # iOS project files
```

## 🆘 Getting Help

1. **Check logs first:**
   ```cmd
   docker-compose -f docker-compose.windows.yml logs -f
   ```

2. **Verify service health:**
   ```cmd
   docker-compose -f docker-compose.windows.yml ps
   ```

3. **Test individual services:**
   - Backend: http://localhost:3001/health
   - Metro: http://localhost:8081/status
   - Database: Use a PostgreSQL client to connect

## 🏁 Next Steps

1. ✅ Services running
2. ✅ Backend API accessible
3. ✅ Database populated with test users
4. 📱 Connect Android emulator/device
5. 🚀 Run `npx react-native run-android`
6. 🎉 Start developing!

---

**Happy coding! 🎉**

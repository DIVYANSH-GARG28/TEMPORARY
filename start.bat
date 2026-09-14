@echo off
echo ===================================================
echo Starting GeoSync Services (Frontend, Backend, DB)
echo ===================================================

echo Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please open Docker Desktop first!
    pause
    exit /b
)

echo Rebuilding and starting containers in detached mode...
docker-compose up --build -d

echo ===================================================
echo Services Started Successfully!
echo ===================================================
echo Frontend UI : http://localhost:5173
echo Backend API : http://localhost:8000
echo ===================================================
pause

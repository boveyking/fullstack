@echo off
REM One-click build and run script for Windows

echo ========================================
echo Building and Running AWS Xray Automation
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not installed or not in PATH
    pause
    exit /b 1
)

echo Docker is installed and ready.
echo.

REM Check if volume exists, if not Docker will create it automatically
echo Checking Docker volume...
docker volume inspect fullstack-data >nul 2>&1
if errorlevel 1 (
    echo Creating Docker volume for database...
    docker volume create fullstack-data
)

echo Building and starting the application...
echo This may take a few minutes on first run...
echo.

REM Build and start the containers
docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo ERROR: Failed to build or start the application
    echo Check the logs above for details
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Application is running!
echo ========================================
echo.
echo Access the application at:
echo   http://localhost:8000
echo.
echo API Health Check:
echo   http://localhost:8000/api/health
echo.
echo To view logs, run:
echo   docker-compose logs -f
echo.
echo To stop the application, run:
echo   docker-compose down
echo.
echo To backup database, run:
echo   manage-volume.bat backup
echo.

REM Wait a few seconds for the application to start
timeout /t 5 /nobreak >nul

REM Try to check if the application is responding
echo Checking if application is ready...
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo Application is starting... it may take a few more seconds.
    echo Check the logs if it doesn't start within a minute.
) else (
    echo Application is ready!
)

echo.
pause


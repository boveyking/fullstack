#!/bin/bash
# One-click build and run script for Linux/Mac
# 
# This script does a FULL CLEAN REBUILD (removes images, builds without cache)
# Use this when:
#   - First time deployment
#   - Docker image structure changed (Dockerfile changes)
#   - Dependencies changed (package.json, requirements.txt)
#   - You're experiencing build issues and need a clean slate
#
# For faster redeployment with source code changes only, use:
#   ./quick-redeploy.sh

echo "========================================"
echo "Building and Running AWS Xray Automation"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker-compose is not installed"
    echo "Please install docker-compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker is installed and ready."
echo ""

# Check if volume exists, if not Docker will create it automatically
echo "Checking Docker volume..."
if ! docker volume inspect fullstack-data > /dev/null 2>&1; then
    echo "Creating Docker volume for database..."
    docker volume create fullstack-data
fi

echo "Building and starting the application..."
echo "This may take a few minutes on first run..."
echo ""

# Clean up existing containers and images, then rebuild from scratch
echo "Stopping existing containers..."
docker-compose down

echo "Removing existing images..."
docker rmi -f $(docker images -q a42* 2>/dev/null) 2>/dev/null

echo "Building without cache..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to build the application"
    echo "Check the logs above for details"
    exit 1
fi

echo "Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to build or start the application"
    echo "Check the logs above for details"
    exit 1
fi

echo ""
echo "========================================"
echo "SUCCESS! Application is running!"
echo "========================================"
echo ""
echo "Access the application at:"
echo "  http://localhost:8000"
echo ""
echo "API Health Check:"
echo "  http://localhost:8000/api/health"
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application, run:"
echo "  docker-compose down"
echo ""
echo "To backup database, run:"
echo "  ./manage-volume.sh backup"
echo ""

# Wait a few seconds for the application to start
sleep 5

# Try to check if the application is responding
echo "Checking if application is ready..."
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "Application is ready!"
else
    echo "Application is starting... it may take a few more seconds."
    echo "Check the logs if it doesn't start within a minute."
fi

echo ""


#!/bin/bash

# Deployment Script for AWS Xray Automation

echo "Starting deployment..."

# 1. Check for database directory
if [ ! -d "data" ]; then
    echo "Creating data directory..."
    mkdir -p data
fi

# 2. Check and copy database if it doesn't exist in data volume source
DB_NAME="aws_xray.db"
DB_SOURCE="./backend/${DB_NAME}"
DB_TARGET="./data/${DB_NAME}"

if [ ! -f "$DB_TARGET" ]; then
    if [ -f "$DB_SOURCE" ]; then
        echo "Initializing database from existing backend database..."
        cp "$DB_SOURCE" "$DB_TARGET"
        echo "Database copied to data volume."
    else
        echo "Warning: No existing database found at $DB_SOURCE. A new one will be created by the application."
    fi
else
    echo "Database already exists in data volume. Using existing data."
fi

# 3. Pull/Build and Start Containers
echo "Building and starting Docker containers..."
# Use docker-compose if available, otherwise docker compose
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "Deployment Successful!"
    echo "Frontend is accessible at http://localhost"
    echo "=========================================="
else
    echo "Deployment Failed!"
    exit 1
fi

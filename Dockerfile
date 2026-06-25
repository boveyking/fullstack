# Multi-stage build for React + FastAPI application

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend with Frontend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=sqlite:////app/data/familys.db

# Expose port
EXPOSE 8000

# Create startup script
RUN echo '#!/bin/sh\n\
set -e\n\
cd /app/backend\n\
# Run database migrations if alembic is configured\n\
if [ -f "alembic.ini" ]; then\n\
    echo "Running database migrations..."\n\
    alembic upgrade head\n\
    echo "Migrations completed successfully"\n\
else\n\
    echo "WARNING: alembic.ini not found, skipping migrations"\n\
fi\n\
# Start the FastAPI application\n\
echo "Starting FastAPI application..."\n\
exec uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]


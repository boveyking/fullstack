# 🏗️ Docker Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Container                         │
│                       familys                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                │  │
│  │                  Port: 8000                          │  │
│  │                                                      │  │
│  │  • API Routes (/api/*)                              │  │
│  │  • Database Management                              │  │
│  │  • Static File Serving                              │  │
│  │  • CORS Configuration                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React Frontend (Static Build)               │  │
│  │                                                      │  │
│  │  • Optimized production bundle                      │  │
│  │  • HTML, CSS, JavaScript                            │  │
│  │  • Served by FastAPI                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Database Layer                          │  │
│  │                                                      │  │
│  │  • SQLite Database                                  │  │
│  │  • Alembic Migrations                               │  │
│  │  • SQLAlchemy ORM                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
└────────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
         ┌──────────────────────────────┐
         │     Docker Named Volume       │
         │      familys-data            │
         │                              │
         │  • SQLite database file      │
         │  • Persistent storage        │
         │  • Managed by Docker         │
         └──────────────────────────────┘
```

## Request Flow

```
┌──────────────┐
│   Browser    │
│ :8000        │
└──────┬───────┘
       │
       │ HTTP Request
       │
       ↓
┌──────────────────────────────────────┐
│      FastAPI Application             │
│                                      │
│  API Request?                        │
│  (/api/*)                            │
│    ↓ Yes                             │
│  ┌───────────────────────┐          │
│  │  API Endpoint Handler │          │
│  │  • Authentication     │          │
│  │  • Business Logic     │          │
│  │  • Database Access    │          │
│  └───────────────────────┘          │
│    ↓                                 │
│  ┌───────────────────────┐          │
│  │   Database Layer      │          │
│  └───────────────────────┘          │
│                                      │
│  Frontend Request?                   │
│  (/, /dashboard, etc.)               │
│    ↓ Yes                             │
│  ┌───────────────────────┐          │
│  │  Static File Handler  │          │
│  │  • Serve React build  │          │
│  │  • SPA fallback       │          │
│  └───────────────────────┘          │
└──────────────────────────────────────┘
```

## Multi-Stage Build Process

```
┌─────────────────────────────────────────────────────────────┐
│                    Stage 1: Frontend Builder                 │
│                      (node:20-alpine)                        │
│                                                              │
│  1. Copy package.json & package-lock.json                   │
│  2. npm ci (install dependencies)                           │
│  3. Copy frontend source code                               │
│  4. npm run build (Vite build)                              │
│  5. Generate optimized static files                         │
│     → /frontend/dist/                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Stage 2: Production                       │
│                    (python:3.11-slim)                        │
│                                                              │
│  1. Install system dependencies (gcc)                       │
│  2. Copy requirements.txt                                   │
│  3. pip install Python packages                             │
│  4. Copy backend source code                                │
│  5. Copy built frontend from Stage 1                        │
│     → /app/frontend/dist/                                   │
│  6. Create database directory                               │
│  7. Setup startup script                                    │
│     • Run Alembic migrations                                │
│     • Start Uvicorn server                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Final Container Image
                   (~500MB compressed)
```

## Volume Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Machine                              │
│                                                              │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │  Management      │         │   Docker Container     │   │
│  │  Scripts         │         │                        │   │
│  │                  │         │  /app/data/           │   │
│  │  • backup        │◄────────┤    ├─ familys.db     │   │
│  │  • restore       │────────►│    └─ *.db-*          │   │
│  │  • inspect       │         │         ↕               │   │
│  └──────────────────┘         └─────────┬──────────────┘   │
│                                          │                   │
│                                          │ mount             │
│                                          ↓                   │
│                          ┌───────────────────────────┐      │
│                          │   Docker Volume           │      │
│                          │  (Named Volume)           │      │
│                          │                           │      │
│                          │      familys-data         │      │
│                          │                           │      │
│                          │  • Optimized for I/O      │      │
│                          │  • Platform independent   │      │
│                          │  • Automatic lifecycle    │      │
│                          └───────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure Inside Container

```
/app/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models/
│   │   ├── crud.py          # Database operations
│   │   ├── model.py         # SQLAlchemy models
│   │   └── schema.py        # Pydantic schemas
│   ├── services/
│   │   ├── aws_mgr.py       # AWS integration
│   │   └── route53.py       # Route53 management
│   ├── alembic/             # Database migrations
│   │   └── versions/
│   ├── alembic.ini          # Alembic configuration
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   └── dist/                # Built React app
│       ├── index.html       # Entry point
│       ├── assets/          # JS, CSS, images
│       │   ├── index-*.js
│       │   └── index-*.css
│       └── ...
│
├── data/                    # Database directory (volume mount)
│   ├── familys.db          # SQLite database
│   ├── familys.db-shm      # Shared memory (temp)
│   └── familys.db-wal      # Write-ahead log (temp)
│
└── start.sh                # Container startup script
```

## Network Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Host Machine                       │
│                                                      │
│  Port 8000 (localhost:8000)                         │
│       ↓                                              │
│  ┌────────────────────────────────────────────┐    │
│  │           Docker Network                   │    │
│  │                                            │    │
│  │    ┌───────────────────────────────┐      │    │
│  │    │     Container                 │      │    │
│  │    │      familys                  │      │    │
│  │    │                               │      │    │
│  │    │  Port 8000 (internal)        │      │    │
│  │    │    ↓                          │      │    │
│  │    │  Uvicorn Server               │      │    │
│  │    │    ├─ API Routes (/api/*)    │      │    │
│  │    │    └─ Static Files (/)       │      │    │
│  │    └───────────────────────────────┘      │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

Port Mapping: 8000:8000 (host:container)
```

## Deployment Workflow

```
┌──────────────┐
│ Source Code  │
│   Changes    │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  1. Build Docker Image                  │
│     docker-compose build                │
│                                         │
│     • Frontend: npm run build           │
│     • Backend: pip install              │
│     • Create optimized image            │
└─────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  2. Create/Update Container             │
│     docker-compose up -d                │
│                                         │
│     • Create volume if needed           │
│     • Mount volume                      │
│     • Start container                   │
└─────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  3. Container Startup                   │
│     /app/start.sh                       │
│                                         │
│     • Run database migrations           │
│     • Start Uvicorn server              │
│     • Listen on port 8000               │
└─────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  4. Application Running                 │
│     http://localhost:8000               │
│                                         │
│     • Serving frontend                  │
│     • Handling API requests             │
│     • Database persistent               │
└─────────────────────────────────────────┘
```

## Key Benefits of This Architecture

### 1. Single Container Simplicity
- ✅ One container for both frontend and backend
- ✅ Single port exposure (8000)
- ✅ Simplified deployment and management
- ✅ Reduced container orchestration complexity

### 2. Optimized Build
- ✅ Multi-stage build reduces final image size
- ✅ Node dependencies not in final image
- ✅ Production-optimized React build
- ✅ Only runtime dependencies included

### 3. Persistent Storage
- ✅ Docker named volumes for database
- ✅ Data survives container restarts
- ✅ Easy backup and restore
- ✅ Platform-independent storage

### 4. Development to Production
- ✅ Same container works in dev and prod
- ✅ Consistent environment across platforms
- ✅ Easy to test locally before deployment
- ✅ Minimal configuration changes needed

## Scalability Considerations

For production at scale, consider:

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ↓                 ↓                 ↓
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │Container│      │Container│      │Container│
    │  #1     │      │  #2     │      │  #3     │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
                          ↓
                 ┌─────────────────┐
                 │  Database       │
                 │  (PostgreSQL/   │
                 │   MySQL)        │
                 └─────────────────┘
```

**Note:** For high-traffic production, migrate from SQLite to PostgreSQL or MySQL.

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                   Internet                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│            Reverse Proxy (Nginx/Traefik)            │
│            • SSL/TLS Termination                     │
│            • Rate Limiting                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│              Docker Container                        │
│              • CORS Configuration                    │
│              • Authentication                        │
│              • Input Validation                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│            Docker Volume                             │
│            • Isolated Storage                        │
│            • Access Control                          │
└─────────────────────────────────────────────────────┘
```


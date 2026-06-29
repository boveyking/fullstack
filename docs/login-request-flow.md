# How `/api/login` Flows Through All 3 Tiers

This document traces a single request — a user submitting the **Login** form — across the
**frontend** (React + Vite), the **backend** (FastAPI), and the **database** (SQLite via
SQLAlchemy). Three diagrams show three different runtime contexts.

Key source files referenced throughout:

| Tier | File | Role |
|------|------|------|
| Frontend | [login.tsx](../frontend/src/pages/login.tsx) | Form + submit handler |
| Frontend | [api.ts](../frontend/src/services/api.ts#L185) | `loginUser()` axios call |
| Frontend | [vite.config.ts](../frontend/vite.config.ts) | Dev proxy `/api` → `:8000` |
| Backend | [main.py:117](../backend/main.py#L117) | `POST /api/login` route |
| Backend | [database.py](../backend/database.py) | `get_db()` session, engine |
| Backend | [crud.py:381](../backend/models/crud.py#L381) | `authenticate_user()` |
| Infra | [Dockerfile](../Dockerfile) | Multi-stage build + migrations |
| Infra | [fullstack.conf](../backend/fullstack.conf) | nginx reverse proxy |

---

## Diagram 1 — Development Mode (Vite dev server + proxy)

In dev, **two** processes run: the Vite dev server on **port 3000** (serves React with
hot reload) and Uvicorn/FastAPI on **port 8000**. The browser only ever talks to port 3000.
Vite's proxy intercepts any path starting with `/api` (and `/ws`) and forwards it to the
backend on `127.0.0.1:8000`. This sidesteps CORS because the browser thinks everything is
same-origin (`localhost:3000`).

```mermaid
sequenceDiagram
    autonumber
    actor U as Browser (user)
    participant V as Vite Dev Server<br/>localhost:3000
    participant F as FastAPI / Uvicorn<br/>127.0.0.1:8000
    participant DB as SQLite<br/>backend/*.db

    Note over U,V: React app loaded from Vite (HMR active)
    U->>V: POST /api/login {username_or_email, password}
    Note right of V: vite.config.ts proxy rule<br/>'/api' → http://127.0.0.1:8000<br/>changeOrigin: true
    V->>F: Proxied POST /api/login
    activate F
    Note right of F: main.py:117 login()<br/>Depends(get_db) opens Session
    F->>DB: SELECT user WHERE email/user_name = ?
    activate DB
    DB-->>F: user row (or none)
    deactivate DB
    Note right of F: crud.authenticate_user()<br/>check is_active + verify password
    F-->>V: 200 LoginResponse {code, result, user_data}
    deactivate F
    V-->>U: Response relayed to browser
    Note over U: login.tsx checks code===200<br/>→ AuthContext.login() + navigate('/')
```

**Why the proxy matters:** without it the browser at `:3000` calling `:8000` directly is a
cross-origin request. The proxy keeps the request same-origin and forwards server-side.
(Note: `api.ts` falls back to `http://localhost:8000` in dev only if `VITE_API_URL` is unset;
the proxy path is the clean default.)

---

## Diagram 2 — Production Mode (nginx → Docker → FastAPI serves static)

In production there is **one** application process. The frontend is **pre-built** into static
files (`frontend/dist`) and FastAPI serves them directly — no Vite, no separate frontend
server. nginx sits in front as a reverse proxy on port **80**, forwarding everything to the
Docker container published on host port **8188**, which maps to container port **8000**.

FastAPI decides per-path: `/api/*` and `/ws/*` hit route handlers; `/assets/*` and `/img/*`
are mounted static dirs; everything else falls through to `serve_frontend()` which returns
`index.html` (SPA fallback for React Router).

```mermaid
sequenceDiagram
    autonumber
    actor U as Browser (user)
    participant N as nginx :80<br/>jared.fei-tian.org
    participant D as Docker publish<br/>host 8188 → container 8000
    participant F as FastAPI / Uvicorn<br/>0.0.0.0:8000 (in container)
    participant S as Static files<br/>frontend/dist
    participant DB as SQLite<br/>/app/data/bkingQ.db (volume)

    U->>N: POST /api/login {credentials}
    Note right of N: fullstack.conf<br/>proxy_pass http://localhost:8188<br/>+ X-Forwarded-* headers + WS upgrade
    N->>D: Forward to host port 8188
    D->>F: Container port 8000
    activate F
    Note right of F: main.py path routing:<br/>/api/* → route handler (NOT static)
    F->>DB: authenticate_user() query
    activate DB
    DB-->>F: user row
    deactivate DB
    F-->>D: 200 LoginResponse JSON
    deactivate F
    D-->>N: Response
    N-->>U: Response

    Note over U,S: Earlier page load (same single origin):
    U->>N: GET /  or  GET /assets/index-*.js
    N->>F: proxied
    alt path = /assets/* or /img/*
        F->>S: StaticFiles mount serves file
        S-->>F: JS / CSS / image
    else any other non-API path
        F->>S: serve_frontend() → index.html
        S-->>F: index.html (SPA fallback)
    end
    F-->>U: static asset (via nginx)
```

**Static mounting (main.py:313-340):** on startup FastAPI checks if `frontend/dist` exists.
If so it `app.mount("/assets", StaticFiles(...))` and `/img`, then registers a catch-all
`GET /{full_path:path}` that serves real files or falls back to `index.html`. Route order
matters — the `/api/...` handlers are declared *before* the catch-all, so API calls never
get swallowed by the SPA fallback.

---

## Diagram 3 — Docker Build & Startup (env vars + Alembic migration)

This shows how the image is built and what happens when the container boots — **before** any
`/api/login` request can be served. Two build stages: Node builds the frontend, then the
Python image copies that build output in alongside the backend.

```mermaid
flowchart TD
    subgraph build["docker build (Dockerfile, multi-stage)"]
        direction TB
        S1["Stage 1: node:20-alpine<br/>npm ci → npm run build<br/>produces /frontend/dist"]
        S2["Stage 2: python:3.11-slim<br/>pip install requirements.txt<br/>COPY backend/ → /app/backend<br/>COPY --from=stage1 dist → /app/frontend/dist"]
        S1 -->|"COPY --from=frontend-builder"| S2
    end

    subgraph env["Environment variables"]
        E1["Dockerfile ENV<br/>PYTHONUNBUFFERED=1<br/>DATABASE_URL=sqlite:////app/data/bkingQ.db"]
        E2["docker-compose.yml<br/>ports 8188:8000<br/>volume app-data → /app/data<br/>(can override env here)"]
    end

    subgraph run["Container startup (/app/start.sh, CMD)"]
        direction TB
        R1["cd /app/backend"]
        R2{"alembic.ini present?"}
        R3["alembic upgrade head<br/>→ apply migrations to DB"]
        R4["skip migrations (warn)"]
        R5["exec uvicorn main:app<br/>--host 0.0.0.0 --port 8000"]
        R6["startup_event(): init_db()<br/>create_all() for any missing tables"]
        R1 --> R2
        R2 -->|yes| R3
        R2 -->|no| R4
        R3 --> R5
        R4 --> R5
        R5 --> R6
    end

    subgraph data["Persistence"]
        DB[("SQLite file<br/>/app/data/bkingQ.db")]
        VOL["Docker named volume<br/>bkingQ-data (survives restarts)"]
    end

    S2 --> E1
    E1 --> R1
    E2 -. mounts .-> VOL
    R3 -->|reads DATABASE_URL| DB
    R6 --> DB
    DB --- VOL
    R5 ==>|"now ready to serve /api/login"| READY(["Listening on :8000"])
```

### How `DATABASE_URL` reaches Alembic and the app

```mermaid
flowchart LR
    ENV["DATABASE_URL<br/>(Dockerfile ENV or compose)"]
    subgraph alembic["alembic/env.py"]
        A1["load_dotenv(backend/.env)"]
        A2["os.getenv('DATABASE_URL')<br/>RuntimeError if missing"]
        A3["resolve relative sqlite path → absolute"]
        A4["config.set_main_option('sqlalchemy.url', ...)"]
    end
    subgraph app["database.py"]
        B1["load_dotenv(backend/.env)"]
        B2["os.getenv('DATABASE_URL')"]
        B3["create_engine(...)<br/>get_db() yields Session"]
    end
    ENV --> A1 --> A2 --> A3 --> A4 --> MIG[["alembic upgrade head<br/>creates / updates tables"]]
    ENV --> B1 --> B2 --> B3 --> QRY[["login() query at request time"]]
    MIG --> DB[("bkingQ.db")]
    QRY --> DB
```

**Migration timing:** Alembic runs **once at container startup** (`alembic upgrade head` in
`start.sh`), bringing the schema to the latest revision *before* Uvicorn starts accepting
traffic. Both Alembic (`env.py`) and the running app (`database.py`) read the **same**
`DATABASE_URL` env var and apply the **same** relative→absolute SQLite path resolution, so
they always point at the identical DB file inside the `app-data` volume. `init_db()` in
`startup_event` is a safety net (`create_all`) — Alembic is the source of truth for schema.

---

## One-line summary per tier

- **Frontend** — `login.tsx` form → `loginUser()` in `api.ts` → `POST /api/login`. In dev the
  request goes through Vite's proxy; in prod through nginx. Same JS code, different transport.
- **Backend** — `main.py:117` `login()` opens a DB session via `Depends(get_db)`, delegates to
  `crud.authenticate_user()`, returns a `LoginResponse` (always 200 envelope with inner `code`).
- **Database** — SQLAlchemy `Session` runs a `SELECT` on the user table in the SQLite file,
  which lives in the persistent `app-data` volume and was schema-migrated by Alembic at boot.

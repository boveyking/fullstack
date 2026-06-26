# Reset Alembic Migration Script

## Overview

`reset_alembic.py` is a **manual utility script** used to reset Alembic migration history for fresh deployments. It consolidates all migration history into a single initial migration.

## Who Runs It?

**Developers/DevOps/Admins** - This is a **manual script** that must be run by a person, not automatically executed.

## When to Run It?

Run this script **ONLY** in these scenarios:

### ✅ When to Run:

1. **Before First Production Deployment**
   - You've been developing with multiple migrations
   - You want to start production with a clean migration history
   - You're deploying to a fresh database (no existing data)

2. **Consolidating Migration History**
   - You have accumulated many migration files during development
   - You want to simplify the migration history before production
   - You're resetting the development environment

3. **Starting Fresh**
   - You want to reset your local development database
   - You're cleaning up test migrations

### ❌ When NOT to Run:

1. **Production Database with Data**
   - Never run this on a production database that has user data
   - This will break the migration history and cause issues

2. **Existing Deployments**
   - Don't run this if you already have deployed instances
   - Other instances won't be able to sync migrations

3. **During Normal Development**
   - Don't run this just to clean up migrations
   - Use normal Alembic commands for regular development

## How to Run

### Prerequisites

- Python environment with Alembic installed
- Access to the backend directory
- **Database file (`fullstack.db`) is OPTIONAL** - script works fine without it

### Execution

**Windows:**
```bash
cd backend
python reset_alembic.py
```

**Linux/Mac:**
```bash
cd backend
python3 reset_alembic.py
```

## What It Does

1. **Removes all migration files** from `alembic/versions/` (except `__init__.py`)
2. **Creates a new initial migration** with a timestamp-based revision ID
3. **Stamps the database** with the new revision ID (only if database exists locally)

**Note:** If no database exists (like in fresh production), the script still works fine. It just skips the stamping step. The database will be created and stamped automatically when you deploy.

## After Running

### For Fresh Deployments:

1. **Commit the changes:**
   ```bash
   git add backend/alembic/versions/
   git commit -m "Reset Alembic migrations for fresh deployment"
   ```

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```
   The database will be created automatically with the new initial migration.

### Important Notes

- ⚠️ **This script modifies your migration history** - make sure to commit changes
- ⚠️ **Backup your database** before running if it contains important data
- ⚠️ **Coordinate with your team** - everyone needs to pull the new migration history
- ✅ **Safe for fresh deployments** - no existing data will be affected

## Example Workflow

```bash
# 1. Run the reset script
cd backend
python reset_alembic.py

# 2. Verify the new migration was created
ls alembic/versions/

# 3. Check current database revision
alembic current

# 4. Commit changes
git add .
git commit -m "Reset migrations for production deployment"

# 5. Deploy
docker-compose up -d
```

## Troubleshooting

### Database not found
- ✅ **This is normal and expected** for fresh production deployments
- The script will skip stamping if the database doesn't exist
- The database will be created automatically when you deploy
- Alembic will stamp it automatically during `docker-compose up -d` startup

### Stamping fails
- Run manually: `alembic stamp <revision_id>`
- The revision ID is shown in the script output

### Migration conflicts
- Make sure all team members pull the latest changes
- Everyone should reset their local databases if needed


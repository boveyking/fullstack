"""
Script to reset Alembic for fresh deployment.

WHO RUNS IT: Developers/DevOps/Admins (manual execution, NOT automatic)

WHEN TO RUN:
- Before first production deployment (consolidating dev migrations)
- Starting fresh with a clean migration history
- Resetting local development environment

WHEN NOT TO RUN:
- On production databases with existing data
- During normal development workflow
- If other instances are already deployed

USAGE:
    cd backend
    python reset_alembic.py

This script:
1. Removes all migration files
2. Creates a new initial migration
3. Stamps the database with the new initial revision
"""
import os
import shutil
from pathlib import Path
from datetime import datetime

def reset_alembic():
    """Reset Alembic for fresh deployment"""
    
    # Get paths
    backend_dir = Path(__file__).parent
    db_file = backend_dir / "fullstack.db"
    versions_dir = backend_dir / "alembic" / "versions"
    
    print("=" * 60)
    print("Resetting Alembic for Fresh Deployment")
    print("=" * 60)
    
    # Step 1: Remove all migration files (except __pycache__)
    print(f"\n[1/3] Removing migration files from {versions_dir}")
    migration_files = list(versions_dir.glob("*.py"))
    migration_files = [f for f in migration_files if f.name != "__init__.py"]
    
    if migration_files:
        for migration_file in migration_files:
            print(f"  Removing: {migration_file.name}")
            migration_file.unlink()
        print(f"✓ Removed {len(migration_files)} migration file(s)")
    else:
        print("  No migration files found")
    
    # Step 2: Create new initial migration
    print(f"\n[2/3] Creating new initial migration")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    initial_migration = versions_dir / f"{timestamp}_initial_migration.py"
    
    initial_content = f'''"""Initial migration

Revision ID: {timestamp}
Revises: 
Create Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '{timestamp}'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Database schema already exists - no changes needed
    # This migration represents the current state of the database
    pass


def downgrade() -> None:
    # No downgrade needed for baseline
    pass
'''
    
    initial_migration.write_text(initial_content)
    print(f"✓ Created initial migration: {initial_migration.name}")
    
    # Step 3: Clear alembic_version table and stamp with new revision (if database exists)
    print(f"\n[3/3] Stamping database with new revision")
    if db_file.exists():
        import sqlite3
        try:
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            # Check if alembic_version table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'")
            if cursor.fetchone():
                cursor.execute("DELETE FROM alembic_version")
                conn.commit()
                print("  Cleared alembic_version table")
            conn.close()
            
            # Stamp the database
            import subprocess
            result = subprocess.run(
                ["alembic", "stamp", timestamp],
                cwd=backend_dir,
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"✓ Database stamped with revision: {timestamp}")
            else:
                print(f"  Warning: Could not auto-stamp. Run manually: alembic stamp {timestamp}")
                print(f"  Error: {result.stderr}")
        except Exception as e:
            print(f"  Warning: Could not auto-stamp. Run manually: alembic stamp {timestamp}")
            print(f"  Error: {e}")
    else:
        print("  Database not found - skipping stamp (this is OK for fresh deployments)")
        print("  The database will be created automatically on first deployment")
        print("  Alembic will stamp it automatically when 'alembic upgrade head' runs")
    
    print("\n" + "=" * 60)
    print("Reset completed successfully!")
    print("\nFor fresh deployments (no database exists yet):")
    print("  1. Commit the new migration file to git")
    print("  2. Deploy: docker-compose up -d")
    print("  3. The database will be created automatically")
    print("  4. Alembic will stamp it automatically during startup")
    print("\nThe script works fine without a database - it just prepares the migration files.")
    print("=" * 60)
    
    return timestamp

if __name__ == "__main__":
    try:
        revision_id = reset_alembic()
        print(f"\n✓ Reset completed successfully!")
        print(f"\nNew revision ID: {revision_id}")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


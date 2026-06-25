# Alembic Database Migrations

This project uses Alembic for database schema migrations.

## Common Commands

### Create a new migration
After modifying your models in `models/model.py`, generate a new migration:
```bash
cd backend
python -m alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
To upgrade your database to the latest version:
```bash
cd backend
python -m alembic upgrade head
```

### Rollback migrations
To downgrade by one version:
```bash
cd backend
python -m alembic downgrade -1
```

To downgrade to a specific revision:
```bash
cd backend
python -m alembic downgrade <revision_id>
```

### View migration history
```bash
cd backend
python -m alembic history
```

### Check current database version
```bash
cd backend
python -m alembic current
```

## Configuration

- **alembic.ini**: Main configuration file
- **alembic/env.py**: Environment configuration (imports your models and database settings)
- **alembic/versions/**: Directory containing all migration scripts

The database URL is automatically loaded from your `.env` file or defaults to `sqlite:///./aws_xray.db`.

## Workflow

1. Modify your models in `backend/models/model.py`
2. Generate migration: `python -m alembic revision --autogenerate -m "Add new column"`
3. Review the generated migration file in `alembic/versions/`
4. Apply migration: `python -m alembic upgrade head`

## Notes

- Always review auto-generated migrations before applying them
- Alembic detects most schema changes automatically, but some changes (like column renames) may need manual adjustment
- Keep your migrations in version control

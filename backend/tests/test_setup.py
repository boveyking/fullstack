"""Test to verify project setup is correct"""
import pytest


def test_imports():
    """Test that all required packages can be imported"""
    try:
        import fastapi
        import uvicorn
        import boto3
        import sqlalchemy
        import pydantic
        import dotenv
        import httpx
        import hypothesis
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import required package: {e}")


def test_main_module():
    """Test that main module can be imported"""
    try:
        from main import app
        assert app is not None
        assert hasattr(app, 'title')
    except ImportError as e:
        pytest.fail(f"Failed to import main module: {e}")


def test_database_module():
    """Test that database module can be imported"""
    try:
        from database import Base, engine, get_db, init_db
        assert Base is not None
        assert engine is not None
        assert callable(get_db)
        assert callable(init_db)
    except ImportError as e:
        pytest.fail(f"Failed to import database module: {e}")

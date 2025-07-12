import pytest
from api import create_app
from api.db import init_db
import sys
import os
# Add the parent directory to Python path so we can import api
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Use SQLite in-memory for tests (isolated, fast, no cleanup needed)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
print(f"Using database: {os.environ['DATABASE_URL']}")


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Create all tables in the in-memory SQLite database once per test session.
    """
    # Import all models so they’re registered on Base
    from api.models import Card

    # Run the CREATE TABLE …
    init_db()

    # No teardown needed: SQLite in-memory goes away when the process ends
    yield


@pytest.fixture(scope="session")
def app():
    """
    Create a Flask app with TESTING=True.
    """
    app = create_app()
    app.config.update({"TESTING": True})
    return app


@pytest.fixture()
def client(app):
    """
    A test client for the app.
    """
    return app.test_client()


@pytest.fixture()
def db_session():
    """
    Provide a SQLAlchemy session bound to the in-memory engine,
    and roll back after each test.
    """
    from api.db import SessionLocal
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(autouse=True)
def reset_database():
    """Clear data before each test"""
    from sqlalchemy import create_engine, text
    from api.db import Base

    # Create a test-specific engine to avoid touching production database
    test_engine = create_engine("sqlite:///:memory:", echo=False)

    # Create tables in the test engine
    Base.metadata.create_all(bind=test_engine)

    with test_engine.connect() as conn:
        # Clear all data from all tables
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(text(f'DELETE FROM "{table.name}";'))

        # Reset auto-increment counters (SQLite only) - only if the table exists
        try:
            conn.execute(text("DELETE FROM sqlite_sequence;"))
        except Exception:
            # sqlite_sequence table doesn't exist, which is fine
            pass

        conn.commit()


@pytest.fixture(autouse=True)
def patch_sessionlocal(monkeypatch, db_session):
    """
    Ensure any call to SessionLocal() in api.logic returns our in-memory db_session.
    """
    monkeypatch.setattr("api.logic.SessionLocal", lambda: db_session)

from api.db import init_db
from api import create_app
import pytest
import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"


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
    from api.db import engine, Base
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@pytest.fixture(autouse=True)
def patch_sessionlocal(monkeypatch, db_session):
    """
    Ensure any call to SessionLocal() in api.logic returns our in-memory db_session.
    """
    monkeypatch.setattr("api.logic.SessionLocal", lambda: db_session)

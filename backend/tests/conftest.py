import pytest
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app import create_app
import jwt
from unittest.mock import patch

# Add the parent directory to Python path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use SQLite in-memory for tests (isolated, fast, no cleanup needed)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
print(f"Using database: {os.environ['DATABASE_URL']}")

# Safety check: Detect if tests try to use production database
PRODUCTION_DATABASE_URLS = [
    "postgresql://",
    "postgres://",
    "mysql://",
    "oracle://",
    "mssql://",
    "sqlite:///",  # File-based SQLite (not in-memory)
]


# Create a single in-memory SQLite engine for the whole test session
TEST_SQLITE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_SQLITE_URL)
TestSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """
    Create all tables in the in-memory SQLite database once per test session.
    """

    # Import test models and base
    from tests.test_models import TestCard, TestUser, TestPokemon_Collection, TestBase

    # Import and monkeypatch production model names to test models
    import app.models
    app.models.User = TestUser
    app.models.Card = TestCard
    app.models.Pokemon_Collection = TestPokemon_Collection
    app.models.Base = TestBase

    # Create tables in the shared in-memory engine
    TestBase.metadata.create_all(bind=test_engine)

    # No teardown needed: SQLite in-memory goes away when the process ends
    yield


@pytest.fixture(scope="session")
def app():
    """
    Create a Flask app with TESTING=True.
    """
    app = create_app()
    app.config.update(
        {"TESTING": True, "SQLALCHEMY_DATABASE_URI": TEST_SQLITE_URL})
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
    Provide a SQLAlchemy session bound to the shared in-memory engine,
    and roll back after each test.
    """
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(autouse=True)
def clean_database(db_session):
    """
    Clean the database before each test to ensure isolation.
    """

    # Import test models
    from tests.test_models import TestBase

    # Clear all data from all tables
    for table in reversed(TestBase.metadata.sorted_tables):
        db_session.execute(text(f'DELETE FROM "{table.name}";'))

    # Reset auto-increment counters (SQLite only)
    try:
        db_session.execute(text("DELETE FROM sqlite_sequence;"))
    except Exception:
        # sqlite_sequence table doesn't exist, which is fine
        pass

    db_session.commit()
    yield


# Additional safety: Monitor database connections during tests
@pytest.fixture(autouse=True)
def monitor_database_connections():
    """
    Monitor database connections to detect production database access.
    """
    import os
    original_db_url = os.environ.get("DATABASE_URL", "")

    yield

    # Check if DATABASE_URL was changed during test
    current_db_url = os.environ.get("DATABASE_URL", "")
    if current_db_url != original_db_url:
        raise RuntimeError(
            f"🚨 SAFETY VIOLATION: DATABASE_URL was changed during test!\n"
            f"Original: {original_db_url}\n"
            f"Current: {current_db_url}\n"
            f"Tests must not modify DATABASE_URL during execution."
        )


@pytest.fixture(autouse=True)
def aggressive_database_safety(monkeypatch):
    """
    Aggressively prevent any production database access by patching
    the database engine creation to fail if it's not in-memory SQLite.
    """
    from sqlalchemy import create_engine

    def safe_create_engine(*args, **kwargs):
        # Check if this is trying to create a production database connection
        url = args[0] if args else kwargs.get('url', '')

        # Only allow in-memory SQLite
        if url != "sqlite:///:memory:":
            raise RuntimeError(
                f"🚨 CRITICAL SAFETY VIOLATION: Attempted to create production database connection!\n"
                f"URL: {url}\n"
                f"Tests must only use 'sqlite:///:memory:' for complete isolation.\n"
                f"This prevents any accidental production database access."
            )

        # Allow in-memory SQLite
        return create_engine(*args, **kwargs)

    # Patch the create_engine function to be safe
    monkeypatch.setattr("sqlalchemy.create_engine", safe_create_engine)


@pytest.fixture(autouse=True)
def check_database_session_after_test(db_session):
    """
    Check that the correct database session is being used after each test.
    This fixture runs after every test to verify database isolation.
    """
    # Store the session info before the test
    session_bind = db_session.bind
    session_url = str(session_bind.url) if session_bind else "No bind"

    yield

    # After the test, verify we're still using the correct session
    current_bind = db_session.bind
    current_url = str(current_bind.url) if current_bind else "No bind"

    # Check that we're using in-memory SQLite
    if current_url != "sqlite:///:memory:":
        raise RuntimeError(
            f"🚨 DATABASE SESSION VIOLATION: Test used wrong database session!\n"
            f"Expected: sqlite:///:memory:\n"
            f"Actual: {current_url}\n"
            f"This indicates the test may have accessed production database."
        )

    # Check that the session is still the same (not replaced)
    if current_bind != session_bind:
        raise RuntimeError(
            f"🚨 SESSION REPLACEMENT VIOLATION: Database session was replaced during test!\n"
            f"Original session: {session_bind}\n"
            f"Current session: {current_bind}\n"
            f"This may indicate unauthorized database access."
        )


@pytest.fixture(autouse=True)
def patch_all_database_access(monkeypatch, db_session):
    """
    Patch ALL database access to use the test database session.
    This ensures that no code can accidentally access the production database.
    """
    # Patch SessionLocal in all modules that use it
    modules_to_patch = [
        "app.logic",
        "app.crud",
        "app.routers.cards",
        "app.routers.authentications.login",
        "app.routers.authentications.register",
        "app.services",
    ]

    for module in modules_to_patch:
        try:
            monkeypatch.setattr(f"{module}.SessionLocal", lambda: db_session)
        except AttributeError:
            # Module might not import SessionLocal directly, that's okay
            pass

    # Also patch the main db module
    monkeypatch.setattr("app.db.SessionLocal", lambda: db_session)

    # Patch any direct imports in logic.py
    monkeypatch.setattr("app.logic.SessionLocal", lambda: db_session)

    # Ensure the test session is used everywhere
    def get_test_session():
        return db_session

    # Patch the SessionLocal function itself
    monkeypatch.setattr("app.db.SessionLocal", get_test_session)


# JWT Authentication Fixtures
@pytest.fixture
def jwt_secret():
    """Provide a test JWT secret for token generation."""
    return "test-secret-key-for-jwt"


@pytest.fixture
def admin_jwt_token(jwt_secret):
    """Generate a JWT token for an admin user."""
    payload = {
        "sub": "test-admin-id",
        "email": "admin@test.com",
        "role": "admin",
        "exp": 9999999999  # Far future expiration
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


@pytest.fixture
def user_jwt_token(jwt_secret):
    """Generate a JWT token for a regular user."""
    payload = {
        "sub": "test-user-id",
        "email": "user@test.com",
        "role": "user",
        "exp": 9999999999  # Far future expiration
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


@pytest.fixture
def auth_headers_admin(admin_jwt_token):
    """Provide headers with admin JWT token."""
    return {"Authorization": f"Bearer {admin_jwt_token}"}


@pytest.fixture
def auth_headers_user(user_jwt_token):
    """Provide headers with user JWT token."""
    return {"Authorization": f"Bearer {user_jwt_token}"}


@pytest.fixture(autouse=True)
def patch_jwt_secret(monkeypatch, jwt_secret):
    """
    Patch the JWT secret in the services module to use our test secret.
    This ensures JWT tokens are generated and validated with the same secret.
    """
    monkeypatch.setattr("app.services.SECRET", jwt_secret)

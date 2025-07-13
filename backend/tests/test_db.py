from sqlalchemy import inspect
from app.db import engine


def test_tables_created(setup_database):
    """
    Ensure that the in-memory SQLite database has created the 'card' table.
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "card" in tables

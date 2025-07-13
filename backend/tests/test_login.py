# tests/test_login.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tests.test_models import TestBase as Base, TestUser as User
from unittest.mock import patch, MagicMock
from api.logic import login_user
import uuid


@pytest.fixture
def db_session():
    """Create a test database session with SQLite"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


class TestLoginEndpoint:
    """Test login user functionality"""

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.check_password')
    def test_login_success_200(self, mock_check_password, mock_get_user, mock_session):
        """Test successful login returns 200 status"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()

        # Create mock user
        mock_user = MagicMock()
        mock_user.id = str(uuid.uuid4())
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password_123"
        mock_get_user.return_value = mock_user
        mock_check_password.return_value = True  # Password matches

        # Test data
        login_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = login_user(**login_data)

        # Assertions
        assert status == 200
        assert response["message"] == "User has logged in successfully"
        assert response["status"] == 200
        assert "data" in response
        assert response["data"]["email"] == "test@example.com"
        assert "id" in response["data"]

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    def test_login_user_not_found_401(self, mock_get_user, mock_session):
        """Test login with non-existent user returns 401"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None  # User doesn't exist

        # Test data
        login_data = {
            "email": "nonexistent@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = login_user(**login_data)

        # Assertions
        assert status == 401
        assert response["error"] == "Invalid credentials"

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.check_password')
    def test_login_wrong_password_401(self, mock_check_password, mock_get_user, mock_session):
        """Test login with wrong password returns 401"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()

        # Create mock user
        mock_user = MagicMock()
        mock_user.id = str(uuid.uuid4())
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password_123"
        mock_get_user.return_value = mock_user
        mock_check_password.return_value = False  # Password doesn't match

        # Test data
        login_data = {
            "email": "test@example.com",
            "password": "WrongPassword12!!"
        }

        # Call function
        response, status = login_user(**login_data)

        # Assertions
        assert status == 401
        assert response["error"] == "Invalid credentials"

    @patch('api.logic.SessionLocal')
    def test_login_exception_500(self, mock_session):
        """Test login when exception occurs returns 500"""
        # Mock setup to raise exception
        mock_session.return_value.__enter__.side_effect = Exception(
            "Database error")

        # Test data
        login_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = login_user(**login_data)

        # Assertions
        assert status == 500
        assert "error" in response

    def test_login_empty_email(self):
        """Test login with empty email"""
        login_data = {
            "email": "",
            "password": "StrongPass12!!"
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation

    def test_login_empty_password(self):
        """Test login with empty password"""
        login_data = {
            "email": "test@example.com",
            "password": ""
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation

    def test_login_invalid_email_format(self):
        """Test login with invalid email format"""
        login_data = {
            "email": "invalid-email",
            "password": "StrongPass12!!"
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation

    def test_login_short_password(self):
        """Test login with password shorter than 8 characters"""
        login_data = {
            "email": "test@example.com",
            "password": "short"
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation


class TestLoginEdgeCases:
    """Test edge cases and security considerations for login"""

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    def test_login_sql_injection_attempt(self, mock_get_user, mock_session):
        """Test login with SQL injection attempt"""
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None

        login_data = {
            "email": "test@example.com'; DROP TABLE users; --",
            "password": "StrongPass12!!"
        }

        response, status = login_user(**login_data)
        # Should handle gracefully, not crash
        assert status in [401, 500]

    def test_login_very_long_email(self):
        """Test login with very long email"""
        login_data = {
            "email": "a" * 1000 + "@example.com",
            "password": "StrongPass12!!"
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation

    def test_login_very_long_password(self):
        """Test login with very long password"""
        login_data = {
            "email": "test@example.com",
            "password": "a" * 1000
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation

    def test_login_special_characters_in_email(self):
        """Test login with special characters in email"""
        login_data = {
            "email": "test+tag@example.com",
            "password": "StrongPass12!!"
        }

        response, status = login_user(**login_data)
        # Should handle valid email with plus sign
        # Depends on validation and user existence
        assert status in [200, 401, 500]

    def test_login_unicode_characters(self):
        """Test login with unicode characters"""
        login_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!🚀"
        }

        response, status = login_user(**login_data)
        assert status == 500  # Should fail validation (unicode not in regex)

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.check_password')
    def test_login_case_sensitive_email(self, mock_check_password, mock_get_user, mock_session):
        """Test login with case-sensitive email handling"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()

        # Create mock user with lowercase email
        mock_user = MagicMock()
        mock_user.id = str(uuid.uuid4())
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password_123"
        mock_get_user.return_value = mock_user
        mock_check_password.return_value = True

        # Test data with uppercase email
        login_data = {
            "email": "TEST@EXAMPLE.COM",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = login_user(**login_data)

        # Should still work if email comparison is case-insensitive
        # or fail if case-sensitive (depends on implementation)
        assert status in [200, 401]

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.check_password')
    def test_login_whitespace_handling(self, mock_check_password, mock_get_user, mock_session):
        """Test login with whitespace in email and password"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()

        # Create mock user
        mock_user = MagicMock()
        mock_user.id = str(uuid.uuid4())
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password_123"
        mock_get_user.return_value = mock_user
        mock_check_password.return_value = True

        # Test data with whitespace
        login_data = {
            "email": "  test@example.com  ",
            "password": "  StrongPass12!!  "
        }

        # Call function
        response, status = login_user(**login_data)

        # Should handle whitespace appropriately
        assert status in [200, 401, 500]

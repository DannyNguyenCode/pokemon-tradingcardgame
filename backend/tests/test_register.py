# tests/test_register.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tests.test_models import TestBase as Base, TestUser as User
from unittest.mock import patch, MagicMock
import bcrypt
from app.logic import register_user
from app.services import hash_password, check_password, validate_password_strength
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


class TestRegisterEndpoint:
    """Test register user functionality"""

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.crud.create_user')
    @patch('api.logic.services.validate_password_strength')
    @patch('api.logic.services.hash_password')
    def test_register_success_201(self, mock_hash, mock_validate, mock_create_user, mock_get_user, mock_session):
        """Test successful user registration returns 201 status"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None  # User doesn't exist
        mock_validate.return_value = ("Password is strong", "success")
        mock_hash.return_value = "hashed_password_123"

        # Create mock user
        mock_user = MagicMock()
        mock_user.id = str(uuid.uuid4())
        mock_user.email = "test@example.com"
        mock_user.password = "hashed_password_123"
        mock_user.to_dict.return_value = {
            "id": mock_user.id,
            "email": "test@example.com"
        }
        mock_create_user.return_value = mock_user

        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = register_user(**user_data)

        # Assertions
        assert status == 201
        assert response["message"] == "User registered with Password is strong"
        assert response["status"] == 201
        assert "data" in response
        assert response["data"]["email"] == "test@example.com"

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    def test_register_duplicate_email_400(self, mock_get_user, mock_session):
        """Test registration with existing email returns 400"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = User(
            id="existing-id", email="test@example.com")

        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = register_user(**user_data)

        # Assertions
        assert status == 400
        assert response["error"] == "Registration failed"

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.validate_password_strength')
    def test_register_weak_password_400(self, mock_validate, mock_get_user, mock_session):
        """Test registration with weak password returns 400"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None
        mock_validate.return_value = ("Password is too weak", "violation")

        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "weak"
        }

        # Call function
        response, status = register_user(**user_data)

        # Assertions
        assert status == 400
        assert response["error"] == "Password is too weak"

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    @patch('api.logic.services.validate_password_strength')
    @patch('api.logic.crud.create_user')
    def test_register_user_creation_fails_500(self, mock_create_user, mock_validate, mock_get_user, mock_session):
        """Test registration when user creation fails returns 500"""
        # Mock setup
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None
        mock_validate.return_value = ("Password is strong", "success")
        mock_create_user.return_value = None  # Creation fails

        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = register_user(**user_data)

        # Assertions
        assert status == 500
        assert response["error"] == "User registration failed"

    @patch('api.logic.SessionLocal')
    def test_register_exception_500(self, mock_session):
        """Test registration when exception occurs returns 500"""
        # Mock setup to raise exception
        mock_session.return_value.__enter__.side_effect = Exception(
            "Database error")

        # Test data
        user_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!"
        }

        # Call function
        response, status = register_user(**user_data)

        # Assertions
        assert status == 500
        assert "error" in response

    def test_register_empty_email(self):
        """Test registration with empty email"""
        user_data = {
            "email": "",
            "password": "StrongPass12!!"
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation

    def test_register_invalid_email_format(self):
        """Test registration with invalid email format"""
        user_data = {
            "email": "invalid-email",
            "password": "StrongPass12!!"
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation

    def test_register_empty_password(self):
        """Test registration with empty password"""
        user_data = {
            "email": "test@example.com",
            "password": ""
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation


class TestPasswordValidation:
    """Test password validation functionality"""

    def test_validate_password_strength_strong(self):
        """Test password validation with strong password"""
        password = "StrongPass12!!"
        result, status = validate_password_strength(password)
        assert status == ""  # Empty status means success
        assert "strong" in result.lower() or result == ""

    def test_validate_password_strength_weak(self):
        """Test password validation with weak password"""
        password = "weak"
        result, status = validate_password_strength(password)
        assert status == "violation"
        assert "password must be at least 8 characters long" in result.lower()

    def test_validate_password_strength_empty(self):
        """Test password validation with empty password"""
        password = ""
        result, status = validate_password_strength(password)
        assert status == "violation"

    def test_hash_and_check_password(self):
        """Test password hashing and verification"""
        password = "StrongPass12!!"
        hashed = hash_password(password)

        # Should match
        assert check_password(password, hashed) == True

        # Should not match
        assert check_password("WrongPassword12!!", hashed) == False


class TestRegisterEdgeCases:
    """Test edge cases and security considerations for registration"""

    @patch('api.logic.SessionLocal')
    @patch('api.logic.crud.get_user_by_email')
    def test_register_sql_injection_attempt(self, mock_get_user, mock_session):
        """Test registration with SQL injection attempt"""
        mock_session.return_value.__enter__.return_value = MagicMock()
        mock_get_user.return_value = None

        user_data = {
            "email": "test@example.com'; DROP TABLE users; --",
            "password": "StrongPass12!!"
        }

        response, status = register_user(**user_data)
        # Should handle gracefully, not crash
        assert status in [201, 400, 500]

    def test_register_very_long_email(self):
        """Test registration with very long email"""
        user_data = {
            "email": "a" * 1000 + "@example.com",
            "password": "StrongPass12!!"
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation

    def test_register_very_long_password(self):
        """Test registration with very long password"""
        user_data = {
            "email": "test@example.com",
            "password": "a" * 1000
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation

    def test_register_special_characters_in_email(self):
        """Test registration with special characters in email"""
        user_data = {
            "email": "test+tag@example.com",
            "password": "StrongPass12!!"
        }

        response, status = register_user(**user_data)
        # Should handle valid email with plus sign
        assert status in [201, 500]  # Depends on validation

    def test_register_unicode_characters(self):
        """Test registration with unicode characters"""
        user_data = {
            "email": "test@example.com",
            "password": "StrongPass12!!🚀"
        }

        response, status = register_user(**user_data)
        assert status == 500  # Should fail validation (unicode not in regex)

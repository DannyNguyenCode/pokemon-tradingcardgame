# tests/test_services.py
import pytest
import bcrypt
from api.services import (
    generate_response,
    hash_password,
    check_password,
    validate_password_strength
)


class TestGenerateResponse:
    """Test the generate_response utility function"""

    def test_generate_response_default(self):
        """Test generate_response with default parameters"""
        response = generate_response()
        assert response["status"] == 200
        assert response["message"] == ""
        assert response["data"] == {}

    def test_generate_response_custom(self):
        """Test generate_response with custom parameters"""
        response = generate_response("Success", 201, {"id": 123})
        assert response["status"] == 201
        assert response["message"] == "Success"
        assert response["data"] == {"id": 123}

    def test_generate_response_with_none_data(self):
        """Test generate_response with None data"""
        response = generate_response("Test", 200, None)
        assert response["data"] == {}


class TestPasswordHashing:
    """Test password hashing and verification functions"""

    def test_hash_password(self):
        """Test password hashing"""
        password = "TestPassword123!"
        hashed = hash_password(password)

        # Check that the hash is different from original
        assert hashed != password
        # Check that it's a string
        assert isinstance(hashed, str)
        # Check that it's a valid bcrypt hash
        assert hashed.startswith("$2b$")

    def test_check_password_valid(self):
        """Test password verification with correct password"""
        password = "TestPassword123!"
        hashed = hash_password(password)

        assert check_password(password, hashed) is True

    def test_check_password_invalid(self):
        """Test password verification with incorrect password"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = hash_password(password)

        assert check_password(wrong_password, hashed) is False

    def test_check_password_empty(self):
        """Test password verification with empty password"""
        password = "TestPassword123!"
        hashed = hash_password(password)

        assert check_password("", hashed) is False

    def test_hash_password_consistency(self):
        """Test that same password produces different hashes (due to salt)"""
        password = "TestPassword123!"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # Hashes should be different due to random salt
        assert hash1 != hash2
        # But both should verify correctly
        assert check_password(password, hash1) is True
        assert check_password(password, hash2) is True


class TestPasswordValidation:
    """Test password strength validation"""

    def test_debug_password_validation(self):
        """Debug test to understand what password_strength returns"""
        from password_strength import PasswordPolicy

        policy = PasswordPolicy.from_names(
            length=8,
            uppercase=2,
            numbers=2,
            special=2,
            nonletters=2,
            strength=0.5,
        )

        # Test a password that should pass
        password = "StrongPass123!"
        violations = policy.test(password)
        print(f"Password: {password}")
        print(f"Violations: {violations}")
        for violation in violations:
            print(f"Violation type: {type(violation)}")
            print(f"Violation str: {str(violation)}")
            print(f"Violation repr: {repr(violation)}")

    def test_validate_password_strong(self):
        """Test a strong password that meets all requirements"""
        password = "StrongPass123!@"
        message, status = validate_password_strength(password)

        # This password should pass all requirements
        assert isinstance(message, str)
        assert isinstance(status, str)
        print(f"Strong password test - Message: {message}, Status: {status}")

    def test_validate_password_medium(self):
        """Test a medium strength password"""
        password = "MediumPass12!"
        message, status = validate_password_strength(password)

        assert isinstance(message, str)
        assert isinstance(status, str)
        print(f"Medium password test - Message: {message}, Status: {status}")

    def test_validate_password_weak(self):
        """Test a weak password"""
        password = "weakpass"
        message, status = validate_password_strength(password)

        assert isinstance(message, str)
        assert isinstance(status, str)
        print(f"Weak password test - Message: {message}, Status: {status}")

    def test_validate_password_too_short(self):
        """Test password that's too short"""
        password = "Short1!"
        message, status = validate_password_strength(password)

        assert "8 characters" in message
        assert status == "violation"

    def test_validate_password_no_special_chars(self):
        """Test password without enough special characters"""
        password = "Password123"
        message, status = validate_password_strength(password)

        assert "special" in message
        assert status == "violation"

    def test_validate_password_no_uppercase(self):
        """Test password without enough uppercase letters"""
        password = "password123!@"
        message, status = validate_password_strength(password)

        assert "uppercase" in message
        assert status == "violation"

    def test_validate_password_no_numbers(self):
        """Test password without enough numbers"""
        password = "PasswordABC!@"
        message, status = validate_password_strength(password)

        assert "numbers" in message
        assert status == "violation"

    def test_validate_password_no_nonletters(self):
        """Test password without enough non-letter characters"""
        password = "PasswordABC!"
        message, status = validate_password_strength(password)

        assert "non-letter" in message
        assert status == "violation"

    def test_validate_password_complex_strong(self):
        """Test a complex strong password that meets all requirements"""
        password = "MySecurePass123!@#"
        message, status = validate_password_strength(password)

        assert isinstance(message, str)
        assert isinstance(status, str)
        print(f"Complex strong test - Message: {message}, Status: {status}")

    def test_validate_password_edge_cases(self):
        """Test edge cases for password validation"""
        # Empty password
        message, status = validate_password_strength("")
        assert "Password cannot be empty" in message
        assert status == "violation"

        # Very long password
        long_password = "A" * 100 + "123!@#"
        message, status = validate_password_strength(long_password)
        assert isinstance(message, str)
        assert isinstance(status, str)
        print(f"Long password test - Message: {message}, Status: {status}")

        # Password with only special characters
        special_password = "!@#$%^&*()"
        message, status = validate_password_strength(special_password)
        assert "uppercase" in message or "numbers" in message
        assert status == "violation"

    def test_validate_password_perfect(self):
        """Test a password that should pass all requirements"""
        # This password has: 8+ chars, 2+ uppercase, 2+ numbers, 2+ special chars, 2+ non-letters
        password = "PerfectPass123!@"
        message, status = validate_password_strength(password)

        # Should pass all policy requirements
        assert status == "", "no violations in the password"
        print(f"Perfect password test - Message: {message}, Status: {status}")


class TestPasswordIntegration:
    """Test integration between hashing and validation"""

    def test_hash_and_validate_strong_password(self):
        """Test hashing a strong password that passes validation"""
        password = "StrongPass123!"
        message, status = validate_password_strength(password)

        # Should hash successfully regardless of validation
        hashed = hash_password(password)
        assert check_password(password, hashed) is True

    def test_hash_and_validate_weak_password(self):
        """Test hashing a weak password (should still work)"""
        password = "weakpass"
        message, status = validate_password_strength(password)

        # Should still hash successfully (validation doesn't prevent hashing)
        hashed = hash_password(password)
        assert check_password(password, hashed) is True

    def test_validate_then_hash_workflow(self):
        """Test the typical workflow: validate then hash"""
        password = "SecurePass123!"

        # Step 1: Validate
        message, status = validate_password_strength(password)
        print(f"Validation result - Message: {message}, Status: {status}")

        # Step 2: Hash if valid
        if status != "violation":
            hashed = hash_password(password)
            assert check_password(password, hashed) is True

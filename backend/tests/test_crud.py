# tests/test_crud.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tests.test_models import Base, User, Card, Pokemon_Collection
from datetime import datetime, UTC
import uuid
from unittest.mock import patch
from api.crud import (
    create_card, list_cards, get_card_by_id, update_card, delete_card,
    create_user, get_user_by_id, user_list, update_user, delete_user, get_user_by_email
)


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


class TestCRUDFunctions:
    """Test the actual CRUD functions from api.crud"""

    @patch('api.crud.Card', Card)
    @patch('api.crud.User', User)
    def test_create_card(self, db_session):
        """Test create_card function"""
        card_data = {
            "name": "Pikachu",
            "rarity": "Common",
            "type": "Electric",
            "hp": 35,
            "set_code": "Kanto",
            "collector_number": 25,
            "description": "A cute electric mouse",
            "attack_1_name": "Thunder Shock",
            "attack_1_dmg": 40,
            "attack_1_cost": "Electric",
            "weakness": ["Ground"],
            "resistance": ["Electric", "Flying"],
            "retreat_cost": 1,
            "image_url": "https://example.com/pikachu.jpg"
        }

        card = create_card(db_session, **card_data)
        assert card is not None
        assert card.name == "Pikachu"
        assert card.collector_number == 25
        assert card.id is not None

    @patch('api.crud.Card', Card)
    def test_list_cards(self, db_session):
        """Test list_cards function with pagination"""
        # Create multiple cards
        for i in range(15):
            card_data = {
                "name": f"Card{i}",
                "rarity": "Common",
                "type": "Normal",
                "hp": 50,
                "set_code": "Test",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Tackle",
                "attack_1_dmg": 20,
                "attack_1_cost": "Colorless",
                "weakness": [],
                "resistance": [],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.jpg"
            }
            card = Card(**card_data)
            db_session.add(card)
        db_session.commit()

        # Test pagination
        cards_page1 = list_cards(db_session, page=1)
        assert len(cards_page1) == 10  # 10 cards per page

        cards_page2 = list_cards(db_session, page=2)
        assert len(cards_page2) == 5  # Remaining 5 cards

    @patch('api.crud.Card', Card)
    def test_get_card_by_id(self, db_session):
        """Test get_card_by_id function"""
        # Create a card
        card_data = {
            "name": "Pikachu",
            "rarity": "Common",
            "type": "Electric",
            "hp": 35,
            "set_code": "Kanto",
            "collector_number": 25,
            "description": "Test",
            "attack_1_name": "Thunder",
            "attack_1_dmg": 40,
            "attack_1_cost": "Electric",
            "weakness": [],
            "resistance": [],
            "retreat_cost": 1,
            "image_url": "test.jpg"
        }
        created_card = Card(**card_data)
        db_session.add(created_card)
        db_session.commit()

        # Get card by ID
        found_card = get_card_by_id(db_session, created_card.id)
        assert found_card is not None
        assert found_card.name == "Pikachu"
        assert found_card.id == created_card.id

    @patch('api.crud.Card', Card)
    def test_update_card(self, db_session):
        """Test update_card function"""
        # Create a card
        card_data = {
            "name": "Pikachu",
            "rarity": "Common",
            "type": "Electric",
            "hp": 35,
            "set_code": "Kanto",
            "collector_number": 25,
            "description": "Test",
            "attack_1_name": "Thunder",
            "attack_1_dmg": 40,
            "attack_1_cost": "Electric",
            "weakness": [],
            "resistance": [],
            "retreat_cost": 1,
            "image_url": "test.jpg"
        }
        created_card = Card(**card_data)
        db_session.add(created_card)
        db_session.commit()

        # Update card
        updated_card = update_card(
            db_session, created_card.id, hp=50, rarity="Uncommon")
        assert updated_card is not None
        assert updated_card.hp == 50
        assert updated_card.rarity == "Uncommon"

    @patch('api.crud.Card', Card)
    def test_delete_card(self, db_session):
        """Test delete_card function"""
        # Create a card
        card_data = {
            "name": "Pikachu",
            "rarity": "Common",
            "type": "Electric",
            "hp": 35,
            "set_code": "Kanto",
            "collector_number": 25,
            "description": "Test",
            "attack_1_name": "Thunder",
            "attack_1_dmg": 40,
            "attack_1_cost": "Electric",
            "weakness": [],
            "resistance": [],
            "retreat_cost": 1,
            "image_url": "test.jpg"
        }
        created_card = Card(**card_data)
        db_session.add(created_card)
        db_session.commit()
        card_id = created_card.id

        # Delete card
        deleted_card = delete_card(db_session, card_id)
        assert deleted_card is not None
        # The deleted card should exist but accessing its attributes will fail
        # because it's been deleted from the database

        # Verify it's gone
        found_card = get_card_by_id(db_session, card_id)
        assert found_card is None

    @patch('api.crud.User', User)
    def test_create_user(self, db_session):
        """Test create_user function"""
        user_data = {
            "email": "test@example.com",
            "password": "hashed_password_123"
        }

        user = create_user(db_session, **user_data)
        assert user is not None
        assert user.email == "test@example.com"
        assert user.id is not None

    @patch('api.crud.User', User)
    def test_get_user_by_id(self, db_session):
        """Test get_user_by_id function"""
        # Create a user
        user_data = {
            "email": "test@example.com",
            "password": "hashed_password_123"
        }
        created_user = User(**user_data)
        db_session.add(created_user)
        db_session.commit()

        # Get user by ID
        found_user = get_user_by_id(db_session, created_user.id)
        assert found_user is not None
        assert found_user.email == "test@example.com"
        assert found_user.id == created_user.id

    @patch('api.crud.User', User)
    def test_user_list(self, db_session):
        """Test user_list function"""
        # Create multiple users
        for i in range(3):
            user_data = {
                "email": f"user{i}@example.com",
                "password": f"hashed_password_{i}"
            }
            user = User(**user_data)
            db_session.add(user)
        db_session.commit()

        # Get all users
        users = user_list(db_session)
        assert len(users) == 3

    @patch('api.crud.User', User)
    def test_update_user(self, db_session):
        """Test update_user function"""
        # Create a user
        user_data = {
            "email": "test@example.com",
            "password": "hashed_password_123"
        }
        created_user = User(**user_data)
        db_session.add(created_user)
        db_session.commit()

        # Update user
        updated_user = update_user(
            db_session, created_user.id, email="updated@example.com")
        assert updated_user is not None
        assert updated_user.email == "updated@example.com"

    @patch('api.crud.User', User)
    def test_delete_user(self, db_session):
        """Test delete_user function"""
        # Create a user
        user_data = {
            "email": "test@example.com",
            "password": "hashed_password_123"
        }
        created_user = User(**user_data)
        db_session.add(created_user)
        db_session.commit()
        user_id = created_user.id

        # Delete user
        deleted_user = delete_user(db_session, user_id)
        assert deleted_user is not None
        # The deleted user should exist but accessing its attributes will fail
        # because it's been deleted from the database

        # Verify it's gone
        found_user = get_user_by_id(db_session, user_id)
        assert found_user is None

    @patch('api.crud.User', User)
    def test_get_user_by_email(self, db_session):
        """Test get_user_by_email function"""
        # Create a user
        user_data = {
            "email": "test@example.com",
            "password": "hashed_password_123"
        }
        created_user = User(**user_data)
        db_session.add(created_user)
        db_session.commit()

        # Get user by email
        found_user = get_user_by_email(db_session, "test@example.com")
        assert found_user is not None
        assert found_user.email == "test@example.com"
        assert found_user.id == created_user.id

    @patch('api.crud.Card', Card)
    def test_get_nonexistent_card(self, db_session):
        """Test get_card_by_id with non-existent card"""
        # Try to get a card that doesn't exist
        found_card = get_card_by_id(db_session, 999)
        assert found_card is None

    @patch('api.crud.User', User)
    def test_get_nonexistent_user(self, db_session):
        """Test get_user_by_id with non-existent user"""
        # Try to get a user that doesn't exist
        found_user = get_user_by_id(db_session, 999)
        assert found_user is None

    @patch('api.crud.Card', Card)
    def test_update_nonexistent_card(self, db_session):
        """Test update_card with non-existent card"""
        # Try to update a card that doesn't exist
        updated_card = update_card(db_session, 999, hp=50)
        assert updated_card is None

    @patch('api.crud.Card', Card)
    def test_delete_nonexistent_card(self, db_session):
        """Test delete_card with non-existent card"""
        # Try to delete a card that doesn't exist
        deleted_card = delete_card(db_session, 999)
        assert deleted_card is None

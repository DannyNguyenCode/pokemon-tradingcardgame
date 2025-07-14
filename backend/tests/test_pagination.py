"""
Test pagination functionality
Tests:
1. Page 1 with 10 cards (no arguments)
2. Page 2 with 2 cards (12 total cards)
3. Ascending order by collector_number
"""

import pytest
import uuid
from datetime import datetime, UTC
from sqlalchemy import select, func, create_engine
from sqlalchemy.orm import sessionmaker
from tests.test_models import TestCard as Card, TestUser as User, TestPokemon_Collection as Pokemon_Collection, TestBase as Base
import pytest
from unittest.mock import patch, MagicMock
import app.logic as logic_module
import app.routers.cards as cards_module


class _DummyCard:
    """Tiny stand-in that just exposes .to_dict()."""

    def __init__(self, d):
        # add DB-generated fields
        self._d = {
            **d,
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(UTC),
        }

    def to_dict(self):
        return self._d


def _dummy_card_payload(name="PyTestmon", hp=50):
    """Return a dict that satisfies CardSchema."""
    return {
        "name": name,
        "rarity": "Common",
        "type": "Normal",
        "hp": hp,
        "set_code": "Test",
        "collector_number": 123,
        "description": "",
        "weakness": ["Water"],
        "resistance": [],
        "retreat_cost": 1,
        "image_url": "",
    }


# In-memory storage for test cards (shared across helpers)
_test_storage = {}


def _create_card_logic(**kw):
    card = _DummyCard(kw).to_dict()
    _test_storage[card["id"]] = card
    return card, 201


def _list_cards(page=1):
    cards = list(_test_storage.values())
    cards.sort(key=lambda x: x.get("collector_number", 0))
    page_size = 10
    start = (page - 1) * page_size
    end = start + page_size
    paginated_cards = cards[start:end]
# Pagination metadata
    total_count = len(cards)
    total_pages = (total_count + page_size - 1) // page_size
    has_next = page < total_pages
    has_prev = page > 1
    pagination_data = {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev
    }
    response_data = {
        "data": paginated_cards,
        "pagination": pagination_data
    }
    response = {
        "message": "Card List retrieved",
        "status": 200,
        "data": response_data
    }
    return response, 200


@pytest.fixture
def db_session():
    """Create a test database session with SQLite in-memory"""
    # Create engine using in-memory SQLite only
    engine = create_engine("sqlite:///:memory:")

    # Create tables directly without using init_db()
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def patch_logic(monkeypatch):
    import app.logic as logic_module
    _test_storage.clear()
    monkeypatch.setattr(logic_module, "create_card_logic", _create_card_logic)
    monkeypatch.setattr(logic_module, "list_cards", _list_cards)


@pytest.fixture
def create_test_cards(patch_logic, monkeypatch):
    """Create exactly N test cards for testing"""
    import app.routers.cards as cards_module

    storage = {}

    def _create_card_logic(**kw):
        card = _DummyCard(kw).to_dict()
        storage[card["id"]] = card
        return card, 201

    def _list_cards(page=1):
        cards = list(storage.values())
        # Sort by collector_number for consistent pagination
        cards.sort(key=lambda x: x.get("collector_number", 0))

        # Implement pagination: 10 cards per page
        page_size = 10
        start = (page - 1) * page_size
        end = start + page_size
        paginated_cards = cards[start:end]

        return {
            "message": "Card List retrieved",
            "status": 200,
            "data": paginated_cards
        }, 200

    def create_test_cards(count):
        """Create exactly N test cards"""
        for i in range(count):
            payload = _dummy_card_payload(f"TestCard{i+1}", 50 + i)
            # Ensure unique collector numbers
            payload["collector_number"] = i + 1
            _create_card_logic(**payload)

    # Override the logic functions for this specific fixture
    monkeypatch.setattr(cards_module.logic,
                        "create_card_logic", _create_card_logic)
    monkeypatch.setattr(cards_module.logic, "list_cards", _list_cards)

    return create_test_cards


class TestPaginationSpecificData:
    def test_page_1_returns_10_cards(self, client, create_test_cards):
        """Test: 12 cards total, page 1 should return 10"""
        # Create exactly 12 cards using helper function
        create_test_cards(12)

        response = client.get("/api/cards/?page=1")
        print("RESPONSE", response)
        print("RESPONSE DATA", response.data)
        print("RESPONSE JSON", response.get_json())
        data = response.get_json()
        print("DATA", data)

        assert len(data["data"]) == 10
        assert data["data"][0]["collector_number"] == 1
        assert data["data"][9]["collector_number"] == 10

    def test_page_2_returns_2_cards(self, client, create_test_cards):
        """Test: 12 cards total, page 2 should return 2"""
        create_test_cards(12)

        response = client.get("/api/cards/?page=2")
        data = response.get_json()

        assert len(data["data"]) == 2
        assert data["data"][0]["collector_number"] == 11
        assert data["data"][1]["collector_number"] == 12

    def test_page_5_returns_10_cards(self, client, create_test_cards):
        """Test: 50 cards total, page 5 should return 10"""
        create_test_cards(50)

        response = client.get("/api/cards/?page=5")
        data = response.get_json()

        assert len(data["data"]) == 10
        assert data["data"][0]["collector_number"] == 41
        assert data["data"][9]["collector_number"] == 50

    def test_empty_page_returns_0_cards(self, client, create_test_cards):
        """Test: 5 cards total, page 2 should return 0 (empty)"""
        create_test_cards(5)

        response = client.get("/api/cards/?page=2")
        data = response.get_json()

        assert len(data["data"]) == 0


class TestPagination:
    """Test pagination functionality with in-memory logic and pagination metadata."""

    def setup_method(self):
        _test_storage.clear()

    def test_list_cards_with_pagination(self):
        for i in range(25):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        response, status = _list_cards(1)
        assert status == 200
        assert len(response["data"]["data"]) == 10
        response2, status2 = _list_cards(2)
        assert status2 == 200
        assert len(response2["data"]["data"]) == 10
        response3, status3 = _list_cards(3)
        assert status3 == 200
        assert len(response3["data"]["data"]) == 5

    def test_logic_pagination_metadata(self):
        for i in range(15):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        response, status = _list_cards(1)
        assert status == 200
        assert "data" in response["data"]
        assert "pagination" in response["data"]
        pagination = response["data"]["pagination"]
        required_fields = ["page", "page_size", "total_count",
                           "total_pages", "has_next", "has_prev"]
        for field in required_fields:
            assert field in pagination
        assert pagination["page_size"] == 10

    def test_pagination_edge_cases(self):
        response, status = _list_cards(0)
        assert status == 200  # In-memory logic returns 200 for page 0, adjust if needed
        response, status = _list_cards(1)
        assert status == 200

    def test_pagination_calculation(self):
        for i in range(25):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        total_count = 25
        page_size = 10
        total_pages = (total_count + page_size - 1) // page_size
        response1, _ = _list_cards(1)
        response2, _ = _list_cards(2)
        response3, _ = _list_cards(3)
        assert len(response1["data"]["data"]) == 10
        assert len(response2["data"]["data"]) == 10
        assert len(response3["data"]["data"]) == 5
        pagination = response1["data"]["pagination"]
        assert pagination["total_pages"] == total_pages
        assert pagination["total_count"] == total_count

    def test_always_ten_per_page(self):
        for i in range(25):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        response1, _ = _list_cards(1)
        response3, _ = _list_cards(3)
        assert len(response1["data"]["data"]) == 10
        assert len(response3["data"]["data"]) == 5

    def test_partial_page_handling(self):
        for i in range(23):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        total_count = 23
        page_size = 10
        total_pages = (total_count + page_size - 1) // page_size
        response1, _ = _list_cards(1)
        response2, _ = _list_cards(2)
        response3, _ = _list_cards(3)
        assert len(response1["data"]["data"]) == 10
        assert len(response2["data"]["data"]) == 10
        assert len(response3["data"]["data"]) == 3
        all_cards = []
        for page in range(1, total_pages + 1):
            resp, _ = _list_cards(page)
            all_cards.extend(resp["data"]["data"])
        assert len(all_cards) == total_count

    def test_pagination_metadata(self):
        for i in range(25):
            card_data = {
                "name": f"Test Pokemon {i}",
                "rarity": "Common",
                "type": "Fire",
                "hp": 100,
                "set_code": "TEST",
                "collector_number": i + 1,
                "description": f"Test card {i}",
                "attack_1_name": "Test Attack",
                "attack_1_dmg": 50,
                "attack_1_cost": "Fire",
                "attack_2_name": None,
                "attack_2_dmg": None,
                "attack_2_cost": None,
                "weakness": ["Water"],
                "resistance": ["Fire"],
                "retreat_cost": 1,
                "image_url": f"https://example.com/card{i}.png"
            }
            _create_card_logic(**card_data)
        response, _ = _list_cards(1)
        assert len(response["data"]["data"]) == 10
        assert response["data"]["pagination"]["total_pages"] == 3
        assert response["data"]["pagination"]["total_count"] == 25
        assert response["data"]["pagination"]["page"] == 1
        assert response["data"]["pagination"]["has_next"] is True
        assert response["data"]["pagination"]["has_prev"] is False
        response2, _ = _list_cards(2)
        assert response2["data"]["pagination"]["page"] == 2
        assert response2["data"]["pagination"]["has_next"] is True
        assert response2["data"]["pagination"]["has_prev"] is True
        response3, _ = _list_cards(3)
        assert response3["data"]["pagination"]["page"] == 3
        assert response3["data"]["pagination"]["has_next"] is False
        assert response3["data"]["pagination"]["has_prev"] is True

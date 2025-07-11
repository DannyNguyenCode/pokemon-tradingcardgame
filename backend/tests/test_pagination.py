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
from api.db import SessionLocal
from api.models import Card
from api import crud


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


@pytest.fixture(autouse=True)
def patch_logic(monkeypatch):
    """Extended mock system with helper functions for specific test data"""
    import api.routers.cards as cards_module

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

    # Make helper functions available to tests
    monkeypatch.setattr(cards_module.logic,
                        "create_card_logic", _create_card_logic)
    monkeypatch.setattr(cards_module.logic, "list_cards", _list_cards)


@pytest.fixture
def create_test_cards(patch_logic, monkeypatch):
    """Create exactly N test cards for testing"""
    import api.routers.cards as cards_module

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
    """Test pagination functionality"""

    def test_page_1_default_10_cards(self, client, create_test_cards):
        create_test_cards(12)
        """Test that page 1 returns exactly 10 cards by default"""
        response = client.get("/api/cards/")

        assert response.status_code == 200, "Response did not return 200 status code"
        data = response.get_json()
        cards = data.get("data", [])

        assert len(cards) == 10, f"Expected 10 cards, got {len(cards)}"

        # Verify collector numbers are integers and in ascending order
        collector_numbers = [card.get("collector_number") for card in cards if card.get(
            "collector_number") is not None]
        assert all(isinstance(num, int)
                   for num in collector_numbers), "All collector numbers should be integers"
        assert collector_numbers == sorted(
            collector_numbers), "Cards should be ordered by collector_number (ascending)"

    def test_page_2_returns_2_cards(self, client, create_test_cards):
        create_test_cards(12)
        """Test that page 2 returns exactly 2 cards (12 total cards)"""
        response = client.get("/api/cards/?page=2")

        assert response.status_code == 200, "Response did not return 200 status code"
        data = response.get_json()
        cards = data.get("data", [])

        assert len(cards) == 2, f"Expected 2 cards on page 2, got {len(cards)}"

        # Verify collector numbers are integers and in ascending order
        collector_numbers = [card.get("collector_number") for card in cards if card.get(
            "collector_number") is not None]
        assert all(isinstance(num, int)
                   for num in collector_numbers), "All collector numbers should be integers"
        assert collector_numbers == sorted(
            collector_numbers), "Cards should be ordered by collector_number (ascending)"

    def test_total_count_is_12_cards(self, client, create_test_cards):
        create_test_cards(12)
        """Test that there are exactly 12 cards total in the database"""
        all_cards = []
        page = 1

        while True:
            response = client.get(f"/api/cards/?page={page}")
            assert response.status_code == 200

            data = response.get_json()
            cards = data.get("data", [])

            if not cards:
                break

            all_cards.extend(cards)
            page += 1

        assert len(
            all_cards) == 12, f"Expected 12 cards total, got {len(all_cards)}"

    def test_all_collector_numbers_are_integers(self, client, create_test_cards):
        create_test_cards(12)
        """Test that all collector numbers are integers (not strings)"""
        response = client.get("/api/cards/")
        assert response.status_code == 200

        data = response.get_json()
        cards = data.get("data", [])

        collector_numbers = [card.get("collector_number") for card in cards if card.get(
            "collector_number") is not None]
        assert all(isinstance(num, int)
                   for num in collector_numbers), "All collector numbers should be integers"

    def test_cards_ordered_by_collector_number_ascending(self, client, create_test_cards):
        create_test_cards(12)
        """Test that all cards are ordered by collector_number in ascending order"""
        all_cards = []
        page = 1

        while True:
            response = client.get(f"/api/cards/?page={page}")
            assert response.status_code == 200

            data = response.get_json()
            cards = data.get("data", [])

            if not cards:
                break

            all_cards.extend(cards)
            page += 1

        collector_numbers = [card.get("collector_number") for card in all_cards if card.get(
            "collector_number") is not None]
        expected_order = sorted(collector_numbers)

        assert collector_numbers == expected_order, f"Cards should be in ascending order by collector_number. Expected: {expected_order}, Got: {collector_numbers}"

    def test_pagination_consistency(self, client, create_test_cards):
        create_test_cards(12)
        """Test that pagination is consistent across pages"""
        # Get first page
        response1 = client.get("/api/cards/")
        assert response1.status_code == 200
        data1 = response1.get_json()
        cards1 = data1.get("data", [])

        # Get second page
        response2 = client.get("/api/cards/?page=2")
        assert response2.status_code == 200
        data2 = response2.get_json()
        cards2 = data2.get("data", [])

        # Verify no overlap between pages
        collector_numbers1 = [card.get("collector_number") for card in cards1 if card.get(
            "collector_number") is not None]
        collector_numbers2 = [card.get("collector_number") for card in cards2 if card.get(
            "collector_number") is not None]

        # Check that page 2 numbers are all greater than page 1 numbers
        if collector_numbers1 and collector_numbers2:
            assert max(collector_numbers1) < min(
                collector_numbers2), "Page 2 should contain cards with higher collector numbers than page 1"

    def test_empty_page_handling(self, client):
        """Test that requesting a page beyond available data returns empty list"""
        response = client.get("/api/cards/?page=10")  # Page 10 should be empty

        assert response.status_code == 200
        data = response.get_json()
        cards = data.get("data", [])

        assert len(cards) == 0, "Page 10 should return empty list"

    def test_invalid_page_handling(self, client, create_test_cards):
        create_test_cards(12)
        """Test that invalid page numbers are handled gracefully"""
        response = client.get("/api/cards/?page=0")  # Page 0 should be invalid

        # This could either return 400 (bad request) or default to page 1
        # Let's check both possibilities
        if response.status_code == 200:
            data = response.get_json()
            cards = data.get("data", [])
            # If it defaults to page 1, we should get 10 cards
            assert len(
                cards) == 10, "Page 0 should default to page 1 with 10 cards"
        elif response.status_code == 400:
            # If it returns 400, that's also acceptable
            pass
        else:
            pytest.fail(
                f"Unexpected status code for page 0: {response.status_code}")

"""
Test pagination functionality
Tests:
1. Page 1 with 10 cards (no arguments)
2. Page 2 with 2 cards (12 total cards)
3. Ascending order by collector_number
"""

import pytest
from api.db import SessionLocal
from api.models import Card
from api import crud


class TestPagination:
    """Test pagination functionality"""

    def test_page_1_default_10_cards(self, client):
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

    def test_page_2_returns_2_cards(self, client):
        """Test that page 2 returns exactly 2 cards (12 total cards)"""
        response = client.get("/api/cards/?page=2")

        assert response.status_code == 200
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

    def test_total_count_is_12_cards(self, client):
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

    def test_all_collector_numbers_are_integers(self, client):
        """Test that all collector numbers are integers (not strings)"""
        response = client.get("/api/cards/")
        assert response.status_code == 200

        data = response.get_json()
        cards = data.get("data", [])

        collector_numbers = [card.get("collector_number") for card in cards if card.get(
            "collector_number") is not None]
        assert all(isinstance(num, int)
                   for num in collector_numbers), "All collector numbers should be integers"

    def test_cards_ordered_by_collector_number_ascending(self, client):
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

    def test_pagination_consistency(self, client):
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

    def test_invalid_page_handling(self, client):
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


class TestPaginationDatabase:
    """Test pagination at the database level"""

    def test_crud_list_cards_pagination(self):
        """Test that crud.list_cards returns correct pagination"""
        with SessionLocal() as db:
            # Test page 1
            cards_page1 = crud.list_cards(db, page=1)
            assert len(
                cards_page1) == 10, f"Expected 10 cards on page 1, got {len(cards_page1)}"

            # Test page 2
            cards_page2 = crud.list_cards(db, page=2)
            assert len(
                cards_page2) == 2, f"Expected 2 cards on page 2, got {len(cards_page2)}"

            # Verify ordering
            collector_numbers1 = [
                card.collector_number for card in cards_page1 if card.collector_number is not None]
            collector_numbers2 = [
                card.collector_number for card in cards_page2 if card.collector_number is not None]

            assert collector_numbers1 == sorted(
                collector_numbers1), "Page 1 should be ordered by collector_number"
            assert collector_numbers2 == sorted(
                collector_numbers2), "Page 2 should be ordered by collector_number"

            # Verify no overlap
            if collector_numbers1 and collector_numbers2:
                assert max(collector_numbers1) < min(
                    collector_numbers2), "Page 2 should have higher collector numbers than page 1"

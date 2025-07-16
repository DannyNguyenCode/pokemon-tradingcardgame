# tests/test_logic.py
import pytest
from datetime import datetime, UTC
from app.logic import create_tcg_card, Pokemon
import uuid
from math import ceil
from tests.test_poke_utils import MockPokemon

# Global storage for sharing between fixtures
_test_storage = {}


def _dummy_card_payload(name: str | None = "PyTestmon", hp: int = 50):
    """Return a dict that satisfies CardSchema."""
    return {
        "name": name,
        "rarity": "Common",
        "type": "Normal",
        "hp": hp,
        "set_code": "Test",
        "collector_number": 123,
        "description": "",

        # "attacks": [
        #     {"name": "Punch", "damage": 10, "cost": "Colorless"},
        #     {"name": "Kick",  "damage":  5, "cost": "Colorless"},
        # ],

        "weakness": ["Water"],
        "resistance": [],
        "retreat_cost": 1,
        "image_url": "",
    }


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


@pytest.fixture(autouse=True)
def patch_logic(monkeypatch):
    """Redirect all logic-layer CRUD helpers to cheap fakes."""
    import app.routers.cards as cards_module
    # Clear storage at the start of each test
    global _test_storage
    _test_storage.clear()

    def _create_card_logic(**kw):
        card = _DummyCard(kw).to_dict()
        _test_storage[card["id"]] = card
        # Return exactly what the real create_card_logic returns
        response = {
            "status": 201,
            "message": "Card created",
            "data": card
        }
        return response, 201

    def _list_cards(page=1, type_filter=None, pokemon_name=None):
        cards = list(_test_storage.values())
        # Sort by collector_number for consistent pagination
        cards.sort(key=lambda x: x.get("collector_number", 0))
        # Implement pagination: 10 cards per page
        page_size = 10
        start = (page - 1) * page_size
        end = start + page_size
        paginated_cards = cards[start:end]

        response = {
            "status": 200,
            "message": "Card List retrieved",
            "data": paginated_cards
        }
        return response, 200

    def _get_card_by_id(id):
        card = _test_storage.get(id)
        if not card:
            return {"error": f"Card with id {id} not found"}, 404

        response = {
            "status": 200,
            "message": "Card retrieved",
            "data": card
        }
        return response, 200

    def _update_card(id, **kw):
        if id not in _test_storage:
            return {"error": f"Card with id {id} not found"}, 404

        _test_storage[id].update(kw)
        response = {
            "status": 200,
            "message": "Card updated",
            "data": _test_storage[id]
        }
        return response, 200

    def _delete_card(id):
        card = _test_storage.pop(id, None)
        if not card:
            return {"error": f"Card with id {id} not found"}, 404

        response = {
            "status": 200,
            "message": "Card deleted",
            "data": {}
        }
        return response, 200
    monkeypatch.setattr(cards_module.logic,
                        "create_card_logic", _create_card_logic)
    monkeypatch.setattr(cards_module.logic, "list_cards", _list_cards)
    monkeypatch.setattr(cards_module.logic, "get_card_by_id", _get_card_by_id)
    monkeypatch.setattr(cards_module.logic, "update_card", _update_card)
    monkeypatch.setattr(cards_module.logic, "delete_card", _delete_card)


@pytest.fixture
def create_test_cards(patch_logic, monkeypatch):
    """Create exactly N test cards for testing"""
    import app.routers.cards as cards_module

    def _create_card_logic(**kw):
        card = _DummyCard(kw).to_dict()
        _test_storage[card["id"]] = card
        return {"message": "Card created", "status": 201, "data": card}

    def create_test_cards(count):
        """Create exactly N test cards"""
        for i in range(count):
            payload = _dummy_card_payload(f"TestCard{i+1}", 50 + i)
            # Ensure unique collector numbers
            payload["collector_number"] = i + 1
            _create_card_logic(**payload)
    monkeypatch.setattr(cards_module.logic,
                        "create_card_logic", _create_card_logic)
    return create_test_cards


class TestLogic:
    def test_create_card_logic(self, client, auth_headers_admin):
        response = client.post(
            "/api/cards/", json=_dummy_card_payload(), headers=auth_headers_admin)
        assert response.status_code == 201
        assert response.get_json(
        )["message"] == "Card created", "should return a success message"
        assert response.get_json(
        )["data"]["name"] == "PyTestmon", "should return the created card"

    def test_create_card_logic_error(self, client,):
        response = client.post(
            "/api/cards/", json=_dummy_card_payload(name=None))
        assert response.status_code == 422, "should return an error status code"
        # The error structure is nested under errors.json.name
        assert "name" in response.get_json(
        )["errors"]["json"], "should return a name field error"
        # Error responses don't have a data key
        assert "data" not in response.get_json(), "error response should not have data key"

    def test_list_cards(self, client, create_test_cards):
        create_test_cards(12)
        response = client.get("/api/cards/")
        assert response.status_code == 200
        assert response.get_json(
        )["message"] == "Card List retrieved", "should return a success message"
        assert len(response.get_json()["data"]) == 10, "should return 10 cards"

    def test_get_card_by_id(self, client, create_test_cards):
        create_test_cards(1)
        # Get the actual card ID from storage
        card_id = list(_test_storage.keys())[0]
        response = client.get(f"/api/cards/{card_id}")
        assert response.status_code == 200
        assert response.get_json(
        )["message"] == "Card retrieved", "should return a success message"
        assert response.get_json(
        )["data"]["name"] == "TestCard1", "should return the created card"

    def test_get_card_by_id_error(self, client):
        response = client.get("/api/cards/100")
        assert response.status_code == 404, "should return an error status code"
        assert response.get_json(
        )["error"] == "Card with id 100 not found", "should return an error message"
        assert "data" not in response.get_json(), "error response should not have data key"

    def test_update_card(self, client, create_test_cards, auth_headers_admin):
        create_test_cards(1)
        # Get the actual card ID from storage
        card_id = list(_test_storage.keys())[0]
        response = client.put(
            f"/api/cards/{card_id}", json=_dummy_card_payload(name="UpdatedCard"), headers=auth_headers_admin)
        assert response.status_code == 200
        assert response.get_json(
        )["message"] == "Card updated", "should return a success message"
        assert response.get_json(
        )["data"]["name"] == "UpdatedCard", "should return the updated card"

    def test_update_card_error(self, client):
        response = client.put(
            "/api/cards/1", json=_dummy_card_payload(name=None))
        assert response.status_code == 422, "should return an error status code"
        assert "name" in response.get_json(
        )["errors"]["json"], "should return a name field error"
        assert "data" not in response.get_json(), "error response should not have data key"

    def test_delete_card(self, client, create_test_cards, auth_headers_admin):
        create_test_cards(1)
        # Get the actual card ID from storage
        card_id = list(_test_storage.keys())[0]
        response = client.delete(
            f"/api/cards/{card_id}", headers=auth_headers_admin)
        assert response.status_code == 200
        assert not response.get_json()["data"], "should not return a card"

    def test_delete_card_error(self, client, auth_headers_admin):
        response = client.delete("/api/cards/100", headers=auth_headers_admin)
        assert response.status_code == 404, "should return an error status code"
        assert response.get_json(
        )["error"] == "Card with id 100 not found", "should return an error message"
        assert "data" not in response.get_json(), "error response should not have data key"

    def test_create_tcg_card_logic(self, monkeypatch):
        """Test the actual create_tcg_card business logic with realistic data"""
        # 1. Mock PokeAPI - return realistic Pokemon data
        def mock_pokemon_fetch(identifier):
            return MockPokemon("pikachu", pokemon_id=25, hp=35)

        # 2. Mock database call - capture what gets saved
        saved_card_data = None

        def mock_create_card_logic(**card_data):
            nonlocal saved_card_data
            saved_card_data = card_data
            return {"id": "123", **card_data}, 201

        # 3. Apply mocks
        monkeypatch.setattr("app.logic.Pokemon.fetch", mock_pokemon_fetch)
        monkeypatch.setattr("app.logic.create_card_logic",
                            mock_create_card_logic)

        # 4. Test real function
        from app.logic import create_tcg_card
        result = create_tcg_card("pikachu")

        # 5. Assert business logic worked correctly
        assert saved_card_data is not None, "create_card_logic was not called"
        assert saved_card_data["name"] == "pikachu", "should return the correct name"
        assert saved_card_data["hp"] == 35, "should return the correct HP"
        assert saved_card_data["type"] == "electric", "should return the correct type"
        assert saved_card_data["rarity"] in ["Common", "Uncommon", "Rare",
                                             "Ultra Rare", "Secret Rare"], "should return a valid rarity"
        assert saved_card_data["set_code"] in [
            "Kanto", "Johto", "Unknown"], "should return a valid set code"
        assert saved_card_data["collector_number"] == 25, "should return the correct collector number"
        assert saved_card_data["description"] is None, "should return the correct description"
        assert saved_card_data["attack_1_name"] is not None, "should have an attack name"
        assert saved_card_data["attack_1_dmg"] >= 0, "attack damage should be non-negative"
        assert saved_card_data["attack_1_cost"] is not None, "should have an attack cost"
        assert isinstance(
            saved_card_data["weakness"], list), "weakness should be a list"
        assert isinstance(
            saved_card_data["resistance"], list), "resistance should be a list"
        assert saved_card_data["retreat_cost"] >= 0, "retreat cost should be non-negative"
        assert saved_card_data["image_url"] is not None, "should have an image URL"

    def test_create_tcg_card_required_fields(self, monkeypatch):
        """Ensure all required card fields are present"""
        # 1. Mock PokeAPI - return realistic Pokemon data
        def mock_pokemon_fetch(identifier):
            return MockPokemon("pikachu", pokemon_id=25, hp=35)

        # 2. Mock database call - capture what gets saved
        saved_card_data = None

        def mock_create_card_logic(**card_data):
            nonlocal saved_card_data
            saved_card_data = card_data
            return {"id": "123", **card_data}, 201

        # 3. Apply mocks
        monkeypatch.setattr("app.logic.Pokemon.fetch", mock_pokemon_fetch)
        monkeypatch.setattr("app.logic.create_card_logic",
                            mock_create_card_logic)

        # 4. Test real function
        from app.logic import create_tcg_card
        result = create_tcg_card("pikachu")

        # 5. Assert all required fields are present
        assert saved_card_data is not None, "create_card_logic was not called"

        required_fields = ["name", "hp", "type", "rarity", "set_code", "collector_number",
                           "description", "attack_1_name", "attack_1_dmg", "attack_1_cost",
                           "weakness", "resistance", "retreat_cost", "image_url"]

        for field in required_fields:
            assert field in saved_card_data, f"Missing required field: {field}"

    def test_create_tcg_card_logic_consistency(self, monkeypatch):
        """Test that same Pokemon always produces same card"""
        # 1. Mock PokeAPI - return realistic Pokemon data
        def mock_pokemon_fetch(identifier):
            return MockPokemon("pikachu", pokemon_id=25, hp=35)

        # 2. Mock database call - capture what gets saved
        saved_card_data_1 = None
        saved_card_data_2 = None

        def mock_create_card_logic(**card_data):
            nonlocal saved_card_data_1, saved_card_data_2
            if saved_card_data_1 is None:
                saved_card_data_1 = card_data
            else:
                saved_card_data_2 = card_data
            return {"id": "123", **card_data}, 201

        # 3. Apply mocks
        monkeypatch.setattr("app.logic.Pokemon.fetch", mock_pokemon_fetch)
        monkeypatch.setattr("app.logic.create_card_logic",
                            mock_create_card_logic)

        # 4. Test real function twice
        from app.logic import create_tcg_card
        result1 = create_tcg_card("pikachu")
        result2 = create_tcg_card("pikachu")

        # 5. Assert both results are identical
        assert saved_card_data_1 is not None, "First call to create_card_logic was not made"
        assert saved_card_data_2 is not None, "Second call to create_card_logic was not made"
        assert saved_card_data_1 == saved_card_data_2, "Same Pokemon should produce identical cards"

# tests/test_cards_routes.py
import uuid
from datetime import datetime, UTC

import pytest


# ───────────────────────────────────────────────────────────────
#  Helpers – one fake Card object & a generator of payloads
# ───────────────────────────────────────────────────────────────
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

# ───────────────────────────────────────────────────────────────
#  Fixtures – patch each logic helper so no DB or HTTP is called
# ───────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def patch_logic(monkeypatch):
    """Redirect all logic-layer CRUD helpers to cheap fakes."""
    import app.routers.cards as cards_module
    # list cards (keep an in-memory “DB” per test)
    storage = {}
    # create from JSON
    monkeypatch.setattr(
        cards_module.logic,
        "create_card_logic",
        lambda **kw: (_DummyCard(kw).to_dict(), 201),
    )

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

    def _create_card_logic(**kw):
        card = _DummyCard(kw).to_dict()
        storage[card["id"]] = card
        return card, 201

    def _get_card(id):
        return storage.get(id) or {}, 404 if id not in storage else 200

    def _update_card(id, **kw):
        storage[id].update(kw)
        return storage[id], 200

    def _delete_card(id):
        storage.pop(id, None)
        return {}, 204

    monkeypatch.setattr(cards_module.logic,
                        "create_card_logic", _create_card_logic)
    monkeypatch.setattr(cards_module.logic, "list_cards", _list_cards)
    monkeypatch.setattr(cards_module.logic, "get_card_by_id", _get_card)
    monkeypatch.setattr(cards_module.logic, "update_card", _update_card)
    monkeypatch.setattr(cards_module.logic, "delete_card", _delete_card)

    # import from Pokémon (no external HTTP)
    monkeypatch.setattr(
        cards_module.logic,                       # note: patch symbol used in router
        "create_tcg_card",
        lambda identifier: (
            _DummyCard(_dummy_card_payload(name=identifier)).to_dict(),
            201,
        ),
    )


# ───────────────────────────────────────────────────────────────
#  Tests
# ───────────────────────────────────────────────────────────────
def test_import_endpoint(client):
    rv = client.post("/api/cards/import/Bulbasaur")
    assert rv.status_code == 201
    assert rv.get_json()["name"] == "Bulbasaur"


def test_collection_crud_cycle(client):
    # ---- 1. create
    payload = None
    for i in range(12):
        payload = _dummy_card_payload(f"Card{i}")
        client.post("/api/cards/", json=payload)
    rv = client.get("/api/cards/")
    assert rv.status_code == 200
    created = rv.get_json()
    card_id = created["data"][0]["id"]

    # ---- 2. list (contains our card)
    rv = client.get("/api/cards/")
    assert rv.status_code == 200
    response = rv.get_json()
    response_data = response["data"]
    assert len(response_data) == 10, "should return 10 cards on this query"
    assert any(
        c["id"] == card_id for c in response_data), "should contain the created card"
    rv2 = client.get("/api/cards/?page=2")
    assert rv2.status_code == 200
    response2 = rv2.get_json()
    response_data2 = response2["data"]
    assert len(response_data2) == 2, "should return 2 cards in this query"
    assert not any(
        c["id"] == card_id for c in response_data2), "should not contain the created card"

    # ---- 3. get single
    rv = client.get(f"/api/cards/{card_id}")
    assert rv.status_code == 200
    assert rv.get_json()["name"] == "Card0"

    # ---- 4. update
    rv = client.put(f"/api/cards/{card_id}", json={"hp": 75})
    assert rv.status_code == 200
    assert rv.get_json()["hp"] == 75

    # ---- 5. delete
    rv = client.delete(f"/api/cards/{card_id}")
    assert rv.status_code == 204

    # ---- 6. confirm gone
    rv = client.get(f"/api/cards/{card_id}")
    assert rv.status_code == 404

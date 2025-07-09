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
        "collector_number": "XYZ",
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
    import api.routers.cards as cards_module

    # create from JSON
    monkeypatch.setattr(
        cards_module.logic,
        "create_card_logic",
        lambda **kw: ( _DummyCard(kw).to_dict(), 201 ),
    )

    # list cards (keep an in-memory “DB” per test)
    storage = {}

    def _list_cards():
        return list(storage.values()), 200

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

    monkeypatch.setattr(cards_module.logic, "create_card_logic", _create_card_logic)
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
    payload = _dummy_card_payload()
    rv = client.post("/api/cards/", json=payload)
    print(rv.status_code, rv.get_json())
    assert rv.status_code == 201
    created = rv.get_json()
    card_id = created["id"]

    # ---- 2. list (contains our card)
    rv = client.get("/api/cards/")
    assert rv.status_code == 200
    assert any(c["id"] == card_id for c in rv.get_json())

    # ---- 3. get single
    rv = client.get(f"/api/cards/{card_id}")
    assert rv.status_code == 200
    assert rv.get_json()["name"] == "PyTestmon"

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

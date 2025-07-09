# tests/test_logic.py
import pytest
from datetime import datetime, UTC
from api.logic import create_tcg_card, Pokemon


@pytest.fixture(autouse=True)
def patch_pokemon(monkeypatch):
    class DummyPokemon(Pokemon):
        raw_data = {
            "id": 999,
            "name": "dummy",
            "types": [{"type": {"name": "normal"}}],
            "stats": [{"stat": {"name": "hp"}, "base_stat": 60}],
            "sprites": {"front_default": None},
            "moves": [],
        }

        @classmethod
        def fetch(cls, identifier):
            return cls(cls.raw_data)

        def fetch_damage_relations(self):
            return {"weakness": ["Fighting"], "resistance": []}

        def fetch_species_info(self):
            return {"is_legendary": False, "is_mythical": False, "generation_url": ""}

    monkeypatch.setattr("api.logic.Pokemon", DummyPokemon)



@pytest.fixture(autouse=True)
def patch_crud(monkeypatch):
    def fake_create_card(db, data_dict):
        """Return a lightweight stand-in that exposes .to_dict()."""
        class DummyCard:
            def __init__(self, payload):
                self._p = payload

            def to_dict(self):
                return self._p

        payload = {
            **data_dict,
            "id": "00000000-0000-0000-0000-000000000000",
            "created_at": datetime.now(UTC),          # timezone-aware
        }
        return DummyCard(payload)

    # Patch the symbol actually referenced inside api.logic
    monkeypatch.setattr("api.logic.crud.create_card", fake_create_card)

@pytest.fixture(autouse=True)
def patch_persistence(monkeypatch):
    """
    Replace create_card_logic so create_tcg_card never reaches the DB
    and never trips JSON/SQLite edge-cases.
    """
    def fake_create_card_logic(**kwargs):
        return ({"message": "Card created", "data": kwargs}, 201)

    # patch the symbol used inside create_tcg_card
    monkeypatch.setattr("api.logic.create_card_logic", fake_create_card_logic)

def test_create_tcg_card_structure():
    resp, status = create_tcg_card("dummy")
    assert status == 201
    assert resp["message"] == "Card created"
    data = resp["data"]
    # sanity-check a couple key fields
    assert data["name"] == "Dummy"
    assert data["weakness"] == ["Fighting"]


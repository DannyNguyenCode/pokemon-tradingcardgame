import pytest
from datetime import datetime
from api.models import Card

def test_card_to_dict_defaults():
    now = datetime.now()
    card = Card(
        id="00000000-0000-0000-0000-000000000000",
        created_at=now,
        name="Testmon",
        rarity="Common",
        type="Normal",
        hp=50,
        set_code="Kanto",
        collector_number="001",
        description="A test Pokémon.",
        attack_1_name="Tackle",
        attack_1_dmg=40,
        attack_1_cost="Colorless",
        attack_2_name=None,
        attack_2_dmg=None,
        attack_2_cost=None,
        weakness=["Water"],
        resistance=[],
        retreat_cost=1,
        image_url="http://example.com/1.png"
    )
    d = card.to_dict()
    assert d["id"] == str(card.id)
    assert isinstance(d["created_at"], datetime)
    assert d["name"] == "Testmon"
    assert isinstance(d["attacks"], list) and len(d["attacks"]) == 2
    assert d["attacks"][0]["name"] == "Tackle"
    assert d["weakness"] == ["Water"]

def test_post_card_directly_with_admin_auth(client, monkeypatch, auth_headers_admin):
    """Test posting a card directly with admin authentication."""
    monkeypatch.setattr(
        "app.routers.cards.logic.create_tcg_card",
        lambda identifier: ({"name": identifier,
                             "rarity": "Common",
                             "type": "Normal",
                             "hp": 30,
                             "set_code": "Test",
                             "collector_number": 456,
                             "description": "",
                             "attack_1_name": "Punch",
                             "attack_1_dmg": 10,
                             "attack_1_cost": "Colorless",
                             "attack_2_name": None,
                             "attack_2_dmg": None,
                             "attack_2_cost": None,
                             "weakness": ["Water"],
                             "resistance": [],
                             "retreat_cost": 1,
                             "image_url": ""}, 201),
    )

    rv = client.post("/api/cards/import/Directmon", headers=auth_headers_admin)
    assert rv.status_code == 201
    body = rv.get_json()
    assert body["name"] == "Directmon"


def test_post_card_directly_without_auth(client, monkeypatch):
    """Test posting a card directly without authentication should fail."""
    monkeypatch.setattr(
        "app.routers.cards.logic.create_tcg_card",
        lambda identifier: ({"name": identifier,
                             "rarity": "Common",
                             "type": "Normal",
                             "hp": 30,
                             "set_code": "Test",
                             "collector_number": 456,
                             "description": "",
                             "attack_1_name": "Punch",
                             "attack_1_dmg": 10,
                             "attack_1_cost": "Colorless",
                             "attack_2_name": None,
                             "attack_2_dmg": None,
                             "attack_2_cost": None,
                             "weakness": ["Water"],
                             "resistance": [],
                             "retreat_cost": 1,
                             "image_url": ""}, 201),
    )

    rv = client.post("/api/cards/import/Directmon")
    assert rv.status_code == 401
    assert "Missing or invalid token" in rv.get_json()["error"]

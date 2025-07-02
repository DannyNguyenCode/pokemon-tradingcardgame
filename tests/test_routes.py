def test_post_card_directly(client, monkeypatch):
    monkeypatch.setattr(
        "api.routers.cards.create_tcg_card",
        lambda identifier: ({"name": identifier,
                             "rarity": "Common",
                             "type": "Normal",
                             "hp": 30,
                             "set_code": "Test",
                             "collector_number": "XXX",
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
    assert rv.status_code == 201
    body = rv.get_json()
    assert body["name"] == "Directmon"

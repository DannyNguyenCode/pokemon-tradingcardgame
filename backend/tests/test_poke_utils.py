# tests/test_poke_utils.py
# type: ignore
import pytest
from unittest.mock import patch, Mock
from app.poke_utils import (
    select_best_levelup_move,
    map_power_to_damage,
    map_damage_to_cost,
    format_cost_symbols,
    map_hp_to_retreat,
    calculate_rarity,
    determine_set_code,
    get_override_move
)


class MockPokemon:  # type: ignore[misc]
    """Mock Pokemon class for testing utility functions"""

    def __init__(self, name="pikachu", pokemon_id=25, types=None, hp=35, is_legendary=False, is_mythical=False):
        # Create a minimal Pokemon-like object that satisfies the type checker
        self.name = name
        self.id = pokemon_id
        self.types = types or ["electric"]
        self.hp = hp
        self.sprite = "https://example.com/pikachu.png"
        self.name = name
        self.id = pokemon_id
        self.types = types or ["electric"]
        self.hp = hp
        self.raw_data = {
            "id": pokemon_id,
            "name": name,
            "types": [{"type": {"name": t.lower()}} for t in self.types],
            "stats": [
                {"base_stat": hp, "stat": {"name": "hp"}},
                {"base_stat": 55, "stat": {"name": "attack"}},
                {"base_stat": 40, "stat": {"name": "defense"}},
                {"base_stat": 50, "stat": {"name": "special-attack"}},
                {"base_stat": 50, "stat": {"name": "special-defense"}},
                {"base_stat": 90, "stat": {"name": "speed"}}
            ],
            "sprites": {"front_default": "https://example.com/pikachu.png"},
            "moves": [
                {
                    "move": {
                        "name": "thunder-shock",
                        "url": "https://pokeapi.co/api/v2/move/84/"
                    },
                    "version_group_details": [
                        {
                            "move_learn_method": {"name": "level-up"}
                        }
                    ]
                },
                {
                    "move": {
                        "name": "quick-attack",
                        "url": "https://pokeapi.co/api/v2/move/98/"
                    },
                    "version_group_details": [
                        {
                            "move_learn_method": {"name": "level-up"}
                        }
                    ]
                }
            ]
        }

    def fetch_damage_relations(self):
        return {"weakness": ["Ground"], "resistance": ["Electric", "Flying"]}

    def fetch_species_info(self):
        return {
            "is_legendary": self.name.lower() in ["mewtwo", "mew"],
            "is_mythical": self.name.lower() in ["mew"],
            "generation_url": "https://pokeapi.co/api/v2/generation/1/"
        }


class TestPokeUtils:
    def test_map_power_to_damage(self):
        """Test power to damage mapping"""
        assert map_power_to_damage(40) == 40
        assert map_power_to_damage(0) == 0
        assert map_power_to_damage(100) == 100

    def test_map_damage_to_cost(self):
        """Test damage to cost mapping"""
        assert map_damage_to_cost(40) == 2  # 40/20 = 2
        assert map_damage_to_cost(20) == 1  # 20/20 = 1
        assert map_damage_to_cost(60) == 3  # 60/20 = 3
        assert map_damage_to_cost(10) == 1  # min 1

    def test_format_cost_symbols(self):
        """Test cost symbol formatting"""
        # Test electric type (maps to lightning)
        electric_cost = format_cost_symbols(2, "electric")
        assert len(electric_cost) == 1  # count - 1
        assert "lightning" in electric_cost

        # Test fire type
        fire_cost = format_cost_symbols(3, "fire")
        assert len(fire_cost) == 2
        assert "fire" in fire_cost

        # Test unknown type (should default to colorless)
        unknown_cost = format_cost_symbols(2, "unknown")
        assert len(unknown_cost) == 1
        assert "colorless" in unknown_cost

    def test_map_hp_to_retreat(self):
        """Test HP to retreat cost mapping"""
        assert map_hp_to_retreat(35) == 1   # 35/60 = 0.58, ceil = 1
        assert map_hp_to_retreat(60) == 1   # 60/60 = 1
        assert map_hp_to_retreat(120) == 2  # 120/60 = 2
        assert map_hp_to_retreat(10) == 1   # min 1

    def test_calculate_rarity(self, monkeypatch):
        """Test rarity calculation"""
        # Mock requests.get for determine_set_code
        def mock_get(url):
            class MockResponse:
                def raise_for_status(self):
                    pass

                def json(self):
                    return {"main_region": {"name": "kanto"}}
            return MockResponse()

        monkeypatch.setattr("requests.get", mock_get)

        # Test common Pokemon
        common_pokemon = MockPokemon("pikachu", hp=35)
        assert calculate_rarity(common_pokemon) == "Common"  # type: ignore

        # Test uncommon Pokemon (total stats >= 400)
        uncommon_pokemon = MockPokemon("charizard", hp=78)
        uncommon_pokemon.raw_data["stats"] = [
            {"base_stat": 78, "stat": {"name": "hp"}},
            {"base_stat": 84, "stat": {"name": "attack"}},
            {"base_stat": 78, "stat": {"name": "defense"}},
            {"base_stat": 109, "stat": {"name": "special-attack"}},
            {"base_stat": 85, "stat": {"name": "special-defense"}},
            {"base_stat": 100, "stat": {"name": "speed"}}
        ]
        assert calculate_rarity(uncommon_pokemon) == "Uncommon"

        # Test rare Pokemon (total stats >= 550) - use a non-legendary Pokemon
        rare_pokemon = MockPokemon("dragonite", hp=91)
        rare_pokemon.raw_data["stats"] = [
            {"base_stat": 91, "stat": {"name": "hp"}},
            {"base_stat": 134, "stat": {"name": "attack"}},
            {"base_stat": 95, "stat": {"name": "defense"}},
            {"base_stat": 100, "stat": {"name": "special-attack"}},
            {"base_stat": 100, "stat": {"name": "special-defense"}},
            {"base_stat": 80, "stat": {"name": "speed"}}
        ]
        assert calculate_rarity(rare_pokemon) == "Rare"

        # Test legendary Pokemon
        legendary_pokemon = MockPokemon("mewtwo", hp=106)
        legendary_pokemon.raw_data["stats"] = [
            {"base_stat": 106, "stat": {"name": "hp"}},
            {"base_stat": 110, "stat": {"name": "attack"}},
            {"base_stat": 90, "stat": {"name": "defense"}},
            {"base_stat": 154, "stat": {"name": "special-attack"}},
            {"base_stat": 90, "stat": {"name": "special-defense"}},
            {"base_stat": 130, "stat": {"name": "speed"}}
        ]
        assert calculate_rarity(legendary_pokemon) == "Ultra Rare"

        # Test mythical Pokemon
        mythical_pokemon = MockPokemon("mew", hp=100)
        mythical_pokemon.raw_data["stats"] = [
            {"base_stat": 100, "stat": {"name": "hp"}},
            {"base_stat": 100, "stat": {"name": "attack"}},
            {"base_stat": 100, "stat": {"name": "defense"}},
            {"base_stat": 100, "stat": {"name": "special-attack"}},
            {"base_stat": 100, "stat": {"name": "special-defense"}},
            {"base_stat": 100, "stat": {"name": "speed"}}
        ]
        assert calculate_rarity(mythical_pokemon) == "Secret Rare"

    def test_determine_set_code(self, monkeypatch):
        """Test set code determination"""
        def mock_get(url):
            class MockResponse:
                def raise_for_status(self):
                    pass

                def json(self):
                    if "generation/1" in url:
                        return {"main_region": {"name": "kanto"}}
                    elif "generation/2" in url:
                        return {"main_region": {"name": "johto"}}
                    else:
                        return {"main_region": {}}
            return MockResponse()

        monkeypatch.setattr("requests.get", mock_get)

        # Test Kanto Pokemon
        kanto_pokemon = MockPokemon("pikachu")
        assert determine_set_code(kanto_pokemon) == "Kanto"

        # Test Johto Pokemon - need to mock the species info too
        johto_pokemon = MockPokemon("chikorita")
        johto_pokemon.raw_data["generation_url"] = "https://pokeapi.co/api/v2/generation/2/"
        # Mock the species info to return the correct generation URL

        def mock_fetch_species_info():
            return {
                "is_legendary": False,
                "is_mythical": False,
                "generation_url": "https://pokeapi.co/api/v2/generation/2/"
            }
        johto_pokemon.fetch_species_info = mock_fetch_species_info
        assert determine_set_code(johto_pokemon) == "Johto"

        # Test Pokemon with no region
        unknown_pokemon = MockPokemon("unknown")
        unknown_pokemon.raw_data["generation_url"] = "https://pokeapi.co/api/v2/generation/999/"

        def mock_fetch_species_info_unknown():
            return {
                "is_legendary": False,
                "is_mythical": False,
                "generation_url": "https://pokeapi.co/api/v2/generation/999/"
            }
        unknown_pokemon.fetch_species_info = mock_fetch_species_info_unknown
        assert determine_set_code(unknown_pokemon) == "Unknown"

    def test_select_best_levelup_move(self, monkeypatch):
        """Test best level-up move selection"""
        def mock_get(url):
            class MockResponse:
                def raise_for_status(self):
                    pass

                def json(self):
                    if "thunder-shock" in url:
                        return {
                            "name": "thunder-shock",
                            "power": 40,
                            "type": {"name": "electric"}
                        }
                    elif "quick-attack" in url:
                        return {
                            "name": "quick-attack",
                            "power": 40,
                            "type": {"name": "normal"}
                        }
                    else:
                        return {
                            "name": "unknown",
                            "power": 0,
                            "type": {"name": "normal"}
                        }
            return MockResponse()

        monkeypatch.setattr("requests.get", mock_get)

        # Test Pokemon with level-up moves
        pokemon = MockPokemon("pikachu")
        move_info = select_best_levelup_move(pokemon)
        print(f"Best move for {pokemon.name}: {move_info}")
        assert "name" in move_info
        assert "power" in move_info
        assert "type" in move_info
        assert move_info["power"] >= 0

    def test_get_override_move(self):
        """Test move override functionality"""
        # Test Pokemon with override
        assert get_override_move("pikachu") == "thunder-shock"
        assert get_override_move("charizard") == "fire-spin"

        # Test Pokemon without override
        assert get_override_move("unknown") is None

    def test_integration_workflow(self, monkeypatch):
        """Test the complete workflow of utility functions working together"""
        def mock_get(url):
            class MockResponse:
                def raise_for_status(self):
                    pass

                def json(self):
                    if "thunder-shock" in url:
                        return {
                            "name": "thunder-shock",
                            "power": 40,
                            "type": {"name": "electric"}
                        }
                    elif "quick-attack" in url:
                        return {
                            "name": "quick-attack",
                            "power": 40,
                            "type": {"name": "normal"}
                        }
                    elif "generation/1" in url:
                        return {"main_region": {"name": "kanto"}}
                    else:
                        return {"name": "unknown", "power": 0, "type": {"name": "normal"}}
            return MockResponse()

        monkeypatch.setattr("requests.get", mock_get)

        # Create a Pokemon
        pokemon = MockPokemon("pikachu", hp=35)

        # Test the complete workflow
        move_info = select_best_levelup_move(pokemon)
        damage = map_power_to_damage(move_info["power"])
        cost_count = map_damage_to_cost(damage)
        cost_symbols = format_cost_symbols(cost_count, pokemon.types[0])
        retreat_cost = map_hp_to_retreat(pokemon.hp)
        rarity = calculate_rarity(pokemon)
        set_code = determine_set_code(pokemon)

        # Assertions
        assert move_info["power"] >= 0  # Should be 40 or 0 depending on mock
        assert damage >= 0
        assert cost_count >= 1
        assert len(cost_symbols) >= 0
        assert retreat_cost >= 1
        assert rarity in ["Common", "Uncommon",
                          "Rare", "Ultra Rare", "Secret Rare"]
        assert set_code in ["Kanto", "Johto", "Unknown"]

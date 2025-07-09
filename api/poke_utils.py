import json
from math import ceil
from pathlib import Path
import requests
from api.pokeapi import Pokemon


BASE = Path(__file__).parent
_MOVE_OVERRIDES = json.loads((BASE / "move_overrides.json").read_text())
ENERGY_MAP = json.loads((BASE / "lib/data/energyMap.json").read_text())


def get_override_move(species: str) -> str | None:
    return _MOVE_OVERRIDES.get(species.lower())

def determine_set_code(p: Pokemon) -> str:
    """
    Uses the Pokémon's species→generation_url→region pipeline
    to derive a region name (e.g. "Kanto", "Johto").
    """
    species = p.fetch_species_info()
    gen_url = species.get("generation_url")
    if not gen_url:
        return "Unknown"
    resp = requests.get(gen_url)
    resp.raise_for_status()
    region = resp.json().get("main_region", {}).get("name", "")
    return region.title() or "Unknown"

def get_move_info(move_url: str) -> dict:
    resp = requests.get(move_url)
    resp.raise_for_status()
    data = resp.json()
    return {
        "name":  data["name"].replace("-", " ").title(),
        "power": data.get("power") or 0,
        "type":  data["type"]["name"].title(),
    }

def map_power_to_damage(power: int) -> int:
    return power

def map_damage_to_cost(damage: int, energy_per_symbol: int = 20) -> int:
    return max(1, ceil(damage / energy_per_symbol))


def format_cost_symbols(count: int, poke_type: str) -> str:
    energy_key = ENERGY_MAP.get(poke_type.lower(), "colorless")

    symbols = [energy_key] * (count - 1)
    return symbols

def map_hp_to_retreat(hp: int, hp_per_retreat: int = 60) -> int:
    return max(1, ceil(hp / hp_per_retreat))

def calculate_rarity(p: Pokemon) -> str:
    species = p.fetch_species_info()
    if species["is_mythical"]:
        return "Secret Rare"
    if species["is_legendary"]:
        return "Ultra Rare"
    total = sum(s["base_stat"] for s in p.raw_data["stats"])
    if total >= 550:
        return "Rare"
    if total >= 400:
        return "Uncommon"
    return "Common"

def select_best_levelup_move(p: Pokemon) -> dict:
    """
    1) If an override move exists, use it.
    2) Else filter for level-up moves, pick the highest-power one.
    """
    override = get_override_move(p.name)
    if override:
        for entry in p.raw_data["moves"]:
            nm = entry["move"]["name"].replace("-", " ").title()
            if nm.lower() == override.lower():
                return get_move_info(entry["move"]["url"])
        # override specified but not found
        raise ValueError(f"Override move '{override}' not found for {p.name}")

    # filter level-up moves
    level_moves = [
        e for e in p.raw_data["moves"]
        if any(v["move_learn_method"]["name"]=="level-up"
               for v in e["version_group_details"])
    ] or p.raw_data["moves"]

    best = {"name": None, "power": 0, "type": p.types[0]}
    for entry in level_moves:
        info = get_move_info(entry["move"]["url"])
        if info["power"] >= best["power"]:
            best = info
    return best

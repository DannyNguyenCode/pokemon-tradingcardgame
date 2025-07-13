# pokeapi.py
import requests
from functools import lru_cache

class Pokemon:
    BASE_URL     = "https://pokeapi.co/api/v2/pokemon/"
    TYPE_URL     = "https://pokeapi.co/api/v2/type/"
    SPECIES_URL  = "https://pokeapi.co/api/v2/pokemon-species/"

    def __init__(self, data: dict):
        self.raw_data = data
        self.id       = data["id"]
        self.name     = data["name"].capitalize()
        self.types    = [t["type"]["name"].title() for t in data["types"]]
        # find HP stat by name
        self.hp       = next(s["base_stat"] for s in data["stats"] if s["stat"]["name"] == "hp")
        self.sprite   = data["sprites"]["front_default"]

    @classmethod
    @lru_cache(maxsize=128)
    def fetch(cls, identifier: str|int) -> "Pokemon":
        resp = requests.get(f"{cls.BASE_URL}{identifier}/")
        resp.raise_for_status()
        return cls(resp.json())

    @lru_cache(maxsize=32)
    def fetch_damage_relations(self) -> dict:
        if not self.types:
            return {"weakness": [], "resistance": []}
        primary = self.types[0].lower()
        resp = requests.get(f"{self.TYPE_URL}{primary}/")
        resp.raise_for_status()
        dr = resp.json()["damage_relations"]
        return {
            "weakness":   [t["name"].title() for t in dr["double_damage_from"]],
            "resistance": [t["name"].title() for t in dr["half_damage_from"]],
        }

    @lru_cache(maxsize=32)
    def fetch_species_info(self) -> dict:
        """
        Returns:
          - is_legendary: bool
          - is_mythical:  bool
          - generation_url: str
        """
        resp = requests.get(f"{self.SPECIES_URL}{self.id}/")
        resp.raise_for_status()
        data = resp.json()
        return {
            "is_legendary": data.get("is_legendary", False),
            "is_mythical":  data.get("is_mythical", False),
            "generation_url": data["generation"]["url"],
        }

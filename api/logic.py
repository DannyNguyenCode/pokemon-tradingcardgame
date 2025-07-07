from flask import abort
from api.db import SessionLocal
from api import crud, services
from api.pokeapi import Pokemon

from api.poke_utils import (
    select_best_levelup_move,
    map_power_to_damage,
    map_damage_to_cost,
    format_cost_symbols,
    map_hp_to_retreat,
    calculate_rarity,
    determine_set_code,
)
CARDS_CACHE= None
def create_card_logic(**kwargs):
    try:
        with SessionLocal() as db:
            card = crud.create_card(db, **kwargs)
            if not card:
                return {"error": "Card creation failed"}, 500
            response = services.generate_response(
                message="Card created",
                status=201,
                data=card.to_dict()
                )
            return response,201 
    except Exception as error:
        return {"error": f"{error}"}, 500
    
def list_cards():
    try:
        global CARDS_CACHE
        if CARDS_CACHE:
            return services.generate_response("Card List retrieved", 200, CARDS_CACHE), 200
    
        with SessionLocal() as db:
            cards = crud.list_cards(db)
            CARDS_CACHE = [card.to_dict() for card in cards]
            response = services.generate_response(message="Card List retreived",status=200,data=CARDS_CACHE)
            return response,200
    except Exception as error:
        return {"error": f"{error}"}, 500
    
def get_card_by_id(id:int):
    try:
        with SessionLocal() as db:
            card = crud.get_card_by_id(db,id)
            if not card:
                return {"error": f"Card with id {id} not found"}, 404
            response = services.generate_response("Card retreived",200,card.to_dict())
            return response,200
    except Exception as error:
        return {"error": f"{error}"}, 500       

def update_card(id:int,**kwargs):
    try:
        with SessionLocal() as db:
            card = crud.update_card(db,id, **kwargs)
            response = services.generate_response("Card updated",200,card.to_dict())
            return response,200
    except Exception as error:
        return {"error": f"{error}"}, 500

def delete_card(id:int):
    try:
        with SessionLocal() as db:
            card = crud.delete_card(db,id)
            if not card:
                return {"error": f"Card with id {id} not found"}, 404
            response = services.generate_response("Card deleted",200)
            return response,200
    except Exception as error:
        return {"error": f"{error}"}, 500
     
def create_tcg_card(identifier: str|int):
    # 1) Core fetch
    try:
        p = Pokemon.fetch(identifier)
    except Exception:
        abort(404, message=f"Pokémon '{identifier}' not found")

    # 2) Single attack
    move_info = select_best_levelup_move(p)
    dmg       = map_power_to_damage(move_info["power"])
    cost_cnt  = map_damage_to_cost(dmg)
    cost_str  = format_cost_symbols(cost_cnt, p.types[0])

    # 3) Other computed fields
    relations = p.fetch_damage_relations()
    retreat   = map_hp_to_retreat(p.hp)
    rarity    = calculate_rarity(p)
    set_code  = determine_set_code(p)

    # 4) Payload
    card_data = {
        "name":              p.name,
        "rarity":            rarity,
        "type":              p.types[0] if p.types else "Colorless",
        "hp":                p.hp,
        "set_code":          set_code,
        "collector_number":  str(p.id),
        "description":       None,
        "attack_1_name":     move_info["name"],
        "attack_1_dmg":      dmg,
        "attack_1_cost":     cost_str,
        "attack_2_name":     None,
        "attack_2_dmg":      None,
        "attack_2_cost":     None,
        "weakness":          relations["weakness"],
        "resistance":        relations["resistance"],
        "retreat_cost":      retreat,
        "image_url":         p.sprite,
    }

    # 5) Persist
    return create_card_logic(**card_data)


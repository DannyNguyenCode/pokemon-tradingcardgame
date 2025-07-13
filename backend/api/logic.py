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

import os
import sys
# Patch for test environment: use test models if running under pytest


def is_pytest():
    return ('pytest' in sys.modules) or (os.environ.get('PYTEST_CURRENT_TEST') is not None)


if is_pytest():
    from tests.test_models import TestCard as Card, TestUser as User, TestPokemon_Collection as Pokemon_Collection
else:
    from api.models import Card, User, Pokemon_Collection


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
            return response, 201
    except Exception as error:
        return {"error": f"{error}"}, 500


def list_cards(page: int):
    if page < 1:
        return {"error": "Page must be 1 or greater"}, 400
    try:
        # Hardcode page size to 10
        page_size = 6

        with SessionLocal() as db:
            cards, total_count = crud.list_cards(db, page)
            print("CARDS", cards)
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size
            has_next = page < total_pages
            has_prev = page > 1

            # Prepare pagination data
            pagination_data = {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev
            }
            print("PAGINATION DATA", pagination_data)
            response = services.generate_response(
                message="Card List retrieved",
                status=200,
                data=[card.to_dict() for card in cards],
                pagination=pagination_data
            )
            print("RESPONSE", response)
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def get_card_by_id(id: int):
    try:
        with SessionLocal() as db:
            card = crud.get_card_by_id(db, id)
            if not card:
                return {"error": f"Card with id {id} not found"}, 404
            response = services.generate_response(
                "Card retrieved", 200, card.to_dict())
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def update_card(id: int, **kwargs):
    try:
        with SessionLocal() as db:
            card = crud.update_card(db, id, **kwargs)
            response = services.generate_response(
                "Card updated", 200, card.to_dict())
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def delete_card(id: int):
    try:
        with SessionLocal() as db:
            card = crud.delete_card(db, id)
            if not card:
                return {"error": f"Card with id {id} not found"}, 404
            response = services.generate_response("Card deleted", 200)
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def create_tcg_card(identifier: str | int):
    # 1) Core fetch
    try:
        p = Pokemon.fetch(identifier)
    except Exception:
        abort(404, message=f"Pokémon '{identifier}' not found")

    # 2) Single attack
    move_info = select_best_levelup_move(p)
    dmg = map_power_to_damage(move_info["power"])
    cost_cnt = map_damage_to_cost(dmg)
    cost_str = format_cost_symbols(cost_cnt, p.types[0])

    # 3) Other computed fields
    relations = p.fetch_damage_relations()
    retreat = map_hp_to_retreat(p.hp)
    rarity = calculate_rarity(p)
    set_code = determine_set_code(p)

    # 4) Payload
    card_data = {
        "name":              p.name,
        "rarity":            rarity,
        "type":              p.types[0] if p.types else "Colorless",
        "hp":                p.hp,
        "set_code":          set_code,
        "collector_number":  p.id,
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


def create_tcg_card_range(start: int, end: int):
    try:
        cards = [create_tcg_card(i) for i in range(start, end + 1)]
        return cards, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def register_user(**data):
    try:
        with SessionLocal() as db:
            user_exists = crud.get_user_by_email(db, data['email'])
            if user_exists:
                return {"error": "Registration failed"}, 400
            validate_password, status = services.validate_password_strength(
                data["password"])
            if status == "violation":
                return {"error": validate_password}, 400
            data['password'] = services.hash_password(data["password"])
            user = crud.create_user(db, **data)
            if not user:
                return {"error": "User registration failed"}, 500
            response = services.generate_response(
                message=f"User registered with {validate_password}", status=201, data=user.to_dict())
            return response, 201
    except Exception as error:
        return {"error": f"{error}"}, 500


def login_user(**data):
    try:
        with SessionLocal() as db:

            user = crud.get_user_by_email(db, data['email'])
            if not user:
                # Use generic error message to prevent user enumeration
                return {"error": "Invalid credentials"}, 401
            if not services.check_password(data["password"], user.password):
                # Use same generic error message for security
                return {"error": "Invalid credentials"}, 401
            return {
                "message": "User has logged in successfully",
                "status": 200,
                "data": {
                    "id": user.id,
                    "email": user.email
                }
            }, 200
    except Exception as error:
        return {"error": f"{error}"}, 500

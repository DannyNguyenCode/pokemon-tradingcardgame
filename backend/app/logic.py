from flask_smorest import abort
from app.db import SessionLocal
from app import crud, services
from app.pokeapi import Pokemon
import uuid
import time
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from app.poke_utils import (
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
    from app.models import Card, User, Pokemon_Collection


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


def list_cards(page: int, type_filter: str | None, pokemon_name: str | None, count_per_page: int = 12):
    if page < 1:
        return {"error": "Page must be 1 or greater"}, 400
    try:

        with SessionLocal() as db:
            cards, total_count = crud.list_cards(
                db, page, type_filter, pokemon_name, count_per_page)
            response = services.generate_response(
                message="Card List retrieved",
                status=200,
                data=[card.to_dict() for card in cards],
                pagination=services.generate_pagination(
                    page, total_count, count_per_page)
            )
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
    print(f"Creating card with data: {card_data}")
    # 5) Persist
    return create_card_logic(**card_data)


def create_tcg_card_range(start: int, end: int):
    try:
        cards = []
        for i in range(start, end+1):
            print(f"Creating card for Pokémon ID: {i}")
            card = create_tcg_card(i)
            cards.append(card)  # Append the response data, not the status code
            time.sleep(1)  # Optional: Throttle requests to avoid rate limits
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
                    "email": user.email,
                    "role": user.role,
                }
            }, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def google_sync(**data):
    try:
        with SessionLocal() as db:
            # Check if Google user exists, else create
            google_user = crud.get_google_user_by_email(db, data['email'])
            if not google_user:
                google_user = crud.add_google_user(db, **data)

            # Check if main user exists, else create
            user = crud.get_user_by_email(db, data['email'])
            if not user:
                user_data = {
                    "email": data['email'],
                    "password": None,
                    "role": "user"
                }
                user = crud.create_user(db, **user_data)
            # Check if link exists, else create
            link = crud.get_link_google_by_user_id(db, user.id)
            if not link:
                link = crud.add_link_google(
                    db, user_id=user.id, google_sub=google_user.id)
            return {
                "message": f"User has logged in with Google",
                "status": 200,
                "data": user.to_dict()
            }, 200

    except Exception as error:
        # Optionally log the error here
        return {"error": f"{error}"}, 500

# Deck Logic


def create_deck_logic(**kwargs):
    try:
        with SessionLocal() as db:
            deck = crud.create_deck(db, **kwargs)
            if not deck:
                return {"error": "Deck creation failed"}, 500
            response = services.generate_response(
                message="Deck created",
                status=201,
                data=deck.to_dict()
            )
            return response, 201
    except Exception as error:
        return {"error": f"{error}"}, 500


def list_decks(page: int, user_id: uuid.UUID, count_per_page):
    logger.info("DEBUG FIRST user_id:", user_id, type(user_id))
    if page < 1:
        return {"error": "Page must be 1 or greater"}, 400
    try:

        with SessionLocal() as db:
            try:
                decks, total_count = crud.list_decks(db, page, user_id)
                logger.info("DEBUG user_id:", user_id, type(user_id))
                logger.info(f"total_count {total_count}")
                if not decks or total_count < 1:
                    return {"error": "No Decks could be retreived"}, 401
            except Exception:
                return {"error":"logic error"}
            try:

                response = services.generate_response(
                    message="Deck List retrieved",
                    status=200,
                    data=[deck.to_dict() for deck in decks],
                    pagination=services.generate_pagination(
                        page, total_count, count_per_page)
                )
                return response, 200
            except Exception:
                return {"error":"response error"}
    except Exception as error:
        logger.info(f"[ERROR] While listing decks: {error}")
        return {"error fetching decks": f"{error}"}, 500


def get_deck_by_id(id: uuid.UUID):
    try:
        with SessionLocal() as db:
            deck = crud.get_deck_by_id(db, id)
            if not deck:
                return {"error": f"Deck with id {id} not found"}, 404
            response = services.generate_response(
                "Deck retrieved", 200, deck.to_dict())
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def update_deck(id: uuid.UUID, **kwargs):
    try:
        with SessionLocal() as db:
            deck = crud.update_deck(db, id, **kwargs)
            response = services.generate_response(
                "Deck updated", 200, deck.to_dict())
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def delete_deck(id: uuid.UUID):
    try:
        with SessionLocal() as db:
            deck = crud.delete_deck(db, id)
            if not deck:
                return {"error": f"Deck with id {id} not found"}, 404
            response = services.generate_response("Deck deleted", 200)
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500

# Deck Card Logic


def add_card_to_deck(deck_id: uuid.UUID, card_id: uuid.UUID):
    try:
        with SessionLocal() as db:
            deck_card = crud.add_deck_card(db, deck_id, card_id)
            if not deck_card:
                return {"error": "Failed to add card to deck"}, 500
            response = services.generate_response(
                message="Card added to deck",
                status=201,
                data={
                    "deck_id": str(deck_card.deck_id),
                    "card_id": str(deck_card.card_id)
                }
            )
            return response, 201
    except Exception as error:
        return {"error": f"{error}"}, 500


def list_deck_cards(deck_id: uuid.UUID):
    try:
        with SessionLocal() as db:

            deck_cards, total_count = crud.list_deck_cards(db, deck_id)
            if not deck_cards:
                return {"error": f"No cards found for deck {deck_id}"}, 404
            response = services.generate_response(
                message="Deck Cards retrieved",
                status=200,
                data=[deck_card.to_dict() for deck_card in deck_cards]
            )
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def get_deck_card_by_id(deck_id: uuid.UUID, card_id: uuid.UUID):
    try:
        with SessionLocal() as db:
            deck_card = crud.get_deck_card_by_id(db, deck_id, card_id)
            if not deck_card:
                return {"error": f"Deck Card with deck_id {deck_id} and card_id {card_id} not found"}, 404
            response = services.generate_response(
                message="Deck Card retrieved",
                status=200,
                data=deck_card.to_dict()
            )
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def update_deck_card(deck_id: uuid.UUID, card_id: uuid.UUID, **kwargs):
    try:
        with SessionLocal() as db:
            deck_card = crud.update_deck_card(db, deck_id, card_id, **kwargs)
            if not deck_card:
                return {"error": f"Deck Card with deck_id {deck_id} and card_id {card_id} not found"}, 404
            response = services.generate_response(
                message="Deck Card updated",
                status=200,
                data=deck_card.to_dict()
            )
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def remove_deck_card_from_deck(deck_id: uuid.UUID, card_id: uuid.UUID):
    try:
        with SessionLocal() as db:
            deck_card = crud.remove_deck_card(db, deck_id, card_id)
            if not deck_card:
                return {"error": f"Deck Card with deck_id {deck_id} and card_id {card_id} not found"}, 404
            response = services.generate_response(
                message="Deck Card removed from deck",
                status=200,
                data={
                    "deck_id": str(deck_card.deck_id),
                    "card_id": str(deck_card.card_id)
                }
            )
            return response, 200
    except Exception as error:
        return {"error": f"{error}"}, 500


def replace_deck_cards(deck_id, card_ids):
    try:
        with SessionLocal() as db:

            deck_card = crud.replace_deck_cards(db, deck_id, card_ids)

            response = services.generate_response(
                message="Deck is now empty" if not deck_card else "Deck has been saved with changes",
                status=200,
                data=[dc.to_dict() for dc in deck_card]
            )
            return response, 200
    except Exception as e:

        return {"error": str(e)}, 500

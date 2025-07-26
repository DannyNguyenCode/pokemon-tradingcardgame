from flask_smorest import Blueprint
from flask.views import MethodView
from app.schemas import DeckCardCreateSchema,DeckCardIn,BulkDeckCardCreateSchema
from app import logic
from app.services import jwt_required
deck_cards_blp = Blueprint("deck_cards", __name__, url_prefix="/api/deck-cards",
                            description="Deck card operations")
@deck_cards_blp.route("/")
class DeckCardCollection(MethodView):
    """Create a deck card, or list all deck cards."""

    # CREATE
    @deck_cards_blp.arguments(DeckCardCreateSchema)
    @deck_cards_blp.doc(
        security=[{"Bearer": []}],
        description="Add single card to deck"
    )
    @jwt_required(["admin","user"])
    def post(self, data):
        response, status = logic.add_card_to_deck(**data)
        return response, status

    # LIST
    @deck_cards_blp.doc(description="Get paginated list of cards that belong to a deck based on deck ID")
    @jwt_required(["admin","user"])
    def get(self):
        response, status = logic.list_deck_cards()
        return response, status

@deck_cards_blp.route("/<uuid:deck_id>")
class DeckCardCollectionByDeck(MethodView): 
    """List all cards in a specific deck."""

    # LIST
    @deck_cards_blp.doc(description="Get paginated list of cards that belong to a deck based on deck ID")
    # @jwt_required(["admin","user"])
    def get(self, deck_id):
        print(f"Deck ID from route: {deck_id}")
        response, status = logic.list_deck_cards(deck_id)
        return response, status

@deck_cards_blp.route("/<uuid:deck_id>/<uuid:card_id>")
class DeckCardItem(MethodView):
    """Retrieve, update, or delete one deck card."""

    # READ
    @deck_cards_blp.doc(description="Get a single card from a specific deck using deck ID and card ID")
    @jwt_required(["admin","user"])
    def get(self, deck_id, card_id):
        response, status = logic.get_deck_card_by_id(deck_id, card_id)
        return response, status
    # UPDATE
    @deck_cards_blp.arguments(DeckCardIn(partial=True))
    @deck_cards_blp.doc(
        security=[{"Bearer": []}],
        description="Update a single deck card by identifiers"
    )
    @jwt_required(["admin","user"])
    def put(self, data, deck_id, card_id):
        response, status = logic.update_deck_card(deck_id, card_id, **data)
        return response, status

    # DELETE
    @deck_cards_blp.doc(
        security=[{"Bearer": []}],
        description="Delete a single deck card by identifiers"
    )
    @jwt_required(["admin","user"])
    def delete(self, deck_id, card_id):
        response, status = logic.remove_deck_card_from_deck(deck_id, card_id)
        return response, status
    
@deck_cards_blp.route("/<uuid:deck_id>/replace")
class DeckCardReplace(MethodView):
    """Replace all cards in a deck with a new list."""

    @deck_cards_blp.arguments(BulkDeckCardCreateSchema)
    @deck_cards_blp.doc(
        security=[{"Bearer": []}],
        description="Replace all cards in a deck (deletes old, inserts new)"
    )
    @jwt_required(["admin", "user"])
    def put(self, data, deck_id):
        response, status = logic.replace_deck_cards(deck_id, data["card_ids"])
        return response, status

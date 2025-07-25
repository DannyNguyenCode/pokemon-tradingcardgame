from flask.views import MethodView
from flask_smorest import Blueprint
from app.schemas import CardIn, CardUpdate, PageArgs
from app import logic
from app.services import jwt_required
cards_blp = Blueprint("cards", __name__, url_prefix="/api/cards",
                      description="Pokémon-TCG card operations")

# ───────────────────────────────────────────────────────────────
# 1) Import-from-Pokémon endpoint
#    POST /api/cards/import/<identifier>
# ───────────────────────────────────────────────────────────────


@cards_blp.route("/import/<string:identifier>")
class CardImport(MethodView):
    """Create a TCG card by scraping data from PokeAPI."""
    @cards_blp.doc(
        security=[{"Bearer": []}],
        description="Create a TCG card from a Pokémon, auto-calculating stats, costs, rarity, and weaknesses"
    )
    @jwt_required(["admin"])
    def post(self, identifier):
        try:
            response, status = logic.create_tcg_card(identifier)
        except Exception as e:
            return {"message": f"Failed to import Pokémon '{identifier}': {e}"}, 500
        return response, status


@cards_blp.route("/import/range/<int:start>/<int:end>")
class CardImportRange(MethodView):
    """Create a range of TCG cards by scraping data from PokeAPI."""
    @cards_blp.doc(
        security=[{"Bearer": []}],
        description="Create a range of TCG cards from a Pokémon, auto-calculating stats, costs, rarity, and weaknesses"
    )
    @jwt_required(["admin"])
    def post(self, start: int, end: int):
        try:
            response, status = logic.create_tcg_card_range(start, end)
        except Exception as e:
            return {"message": f"Failed to import Pokémon '{start} to {end}': {e}"}, 500

        return response, status

# ───────────────────────────────────────────────────────────────
# 2) Collection endpoints
#    POST /api/cards/     -> create from raw JSON
#    GET  /api/cards/     -> list cards
# ───────────────────────────────────────────────────────────────


@cards_blp.route("/")
class CardCollection(MethodView):
    """Create a card manually, or list all cards."""

    # CREATE
    @cards_blp.arguments(CardIn)
    @cards_blp.doc(
        security=[{"Bearer": []}],
        description="Create a pokemon card"
    )
    @jwt_required(["admin"])
    def post(self, data):
        response, status = logic.create_card_logic(**data)
        return response, status

    # LIST
    @cards_blp.doc(description="Get paginated list of pokemon cards with count and pagination metadata (10 per page)")
    @cards_blp.arguments(PageArgs, location="query")
    def get(self, args):
        page = args.get("page", 1)
        count_per_page = args.get("count_per_page", 12)
        type_filter = args.get("type_filter", None)
        pokemon_name = args.get("pokemon_name", None)
        print(f"Listing cards with page={page}, type_filter={type_filter}, pokemon_name={pokemon_name}, count_per_page={count_per_page}")
        if page < 1:
            page = 1
        response, status = logic.list_cards(page, type_filter, pokemon_name, count_per_page)
        return response, status

# ───────────────────────────────────────────────────────────────
# 3) Single-resource endpoints
#    GET    /api/cards/<id>
#    PUT    /api/cards/<id>
#    DELETE /api/cards/<id>
# ───────────────────────────────────────────────────────────────


@cards_blp.route("/<string:id>")
class CardItem(MethodView):
    """Retrieve, update, or delete one card."""

    # READ
    @cards_blp.doc(description="Get a single pokemon card by identifier")
    def get(self, id):
        response, status = logic.get_card_by_id(id)
        return response, status

    # UPDATE (partial=True lets clients patch one field or full replace)

    @cards_blp.arguments(CardUpdate(partial=True))
    @cards_blp.doc(
        security=[{"Bearer": []}],
        description="Update a single pokemon card by identifier"
    )
    @jwt_required(["admin"])
    def put(self, data, id):
        response, status = logic.update_card(id, **data)
        return response, status

    # DELETE
    @cards_blp.doc(
        security=[{"Bearer": []}],
        description="Delete a single pokemon card by identifier"
    )
    @jwt_required(["admin"])
    def delete(self, id):
        response, status = logic.delete_card(id)
        return response, status

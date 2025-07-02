from flask_smorest import Blueprint
from flask.views import MethodView
from api.schemas import CardIn,CardUpdate
from api import logic
cards_blp = Blueprint("cards", __name__, url_prefix="/api/cards", description="Pokémon-TCG card operations")

# ───────────────────────────────────────────────────────────────
# 1) Import-from-Pokémon endpoint
#    POST /api/cards/import/<identifier>
# ───────────────────────────────────────────────────────────────

@cards_blp.route("/import/<string:identifier>")
class CardImport(MethodView):
    """Create a TCG card by scraping data from PokeAPI."""
    @cards_blp.doc(
        description="Create a TCG card from a Pokémon, auto-calculating stats, costs, rarity, and weaknesses"
    )
    def post(self, identifier):
        try:
            response, status = logic.create_tcg_card(identifier)
        except Exception as e:
            return {"message":f"Failed to import Pokémon '{identifier}': {e}"},500
  
        return response,status

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
    @cards_blp.doc(description="Create a pokemon card")
    def post(self,data):
        response,status = logic.create_card_logic(**data)
        return response,status
    
    # LIST
    @cards_blp.doc(description="Get full list of pokemon cards")
    def get(self):
        response,status = logic.list_cards()
        return response,status

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
    def get(self,id):
        response,status=logic.get_card_by_id(id)
        return response,status
    
    # UPDATE (partial=True lets clients patch one field or full replace)

    @cards_blp.arguments(CardUpdate(partial=True))
    @cards_blp.doc(description="Update a single pokemon card by identifier")
    def put(self,data,id):
        response,status=logic.update_card(id,**data)
        return response,status
    
    # DELETE
    @cards_blp.doc(description="Delete a single pokemon card by identifier")
    def delete(self,id):
        response,status = logic.delete_card(id)
        return response,status
    

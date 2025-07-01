from flask_smorest import Blueprint
from flask.views import MethodView
from api.schemas import CardSchema
from api.logic import create_tcg_card
cards_blp = Blueprint("cards", __name__, url_prefix="/api/cards", description="Cards operations")

@cards_blp.route("/import/<string:identifier>")
class CardList(MethodView):
   
    @cards_blp.response(201, CardSchema)
    @cards_blp.doc(
        description="Create a TCG card from a Pokémon, auto-calculating stats, costs, rarity, and weaknesses"
    )
    def post(self, identifier):
        try:
            response, status = create_tcg_card(identifier)
        except Exception as e:
            return {"message":f"Failed to import Pokémon '{identifier}': {e}"},status
        return response



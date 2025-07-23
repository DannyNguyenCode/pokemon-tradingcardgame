from flask.views import MethodView
from flask_smorest import Blueprint
from app.schemas import DeckIn, DeckUpdate, PageArgs
from app import logic
from app.services import jwt_required, get_jwt_identity

decks_blp = Blueprint("decks", __name__, url_prefix="/api/decks",
                      description="Deck operations")


@decks_blp.route("/")
class DeckCollection(MethodView):
    """Create a deck, or list all cards."""

    # CREATE
    @decks_blp.arguments(DeckIn)
    @decks_blp.doc(
        security=[{"Bearer": []}],
        description="Create a deck"
    )
    @jwt_required(["admin"])
    def post(self, data):
        response, status = logic.create_deck_logic(**data)
        return response, status

    # LIST
    @decks_blp.doc(description="Get paginated list of decks with count and pagination metadata (10 per page)")
    @decks_blp.arguments(PageArgs, location="query")
    @jwt_required(["admin", "user"])
    def get(self, args):
        page = args.get("page", 1)
        user_id = get_jwt_identity()
        response, status = logic.list_decks(page, user_id)
        return response, status

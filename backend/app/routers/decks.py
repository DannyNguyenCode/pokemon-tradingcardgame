from flask.views import MethodView
from flask_smorest import Blueprint
from app.schemas import DeckIn, DeckUpdate, PageArgs
from app import logic
from app.services import jwt_required, get_jwt_identity
import logging
import uuid
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
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
    @jwt_required(["admin", "user"])
    def post(self, data):
        response, status = logic.create_deck_logic(**data)
        return response, status

    # LIST
    @decks_blp.doc(security=[{"Bearer": []}], description="Get paginated list of decks with count and pagination metadata (10 per page)")
    @decks_blp.arguments(PageArgs, location="query")
    @jwt_required(["admin", "user"])
    def get(self, args):
        print("✅ ARGS RECEIVED:", args)
        try:
            page = args.get("page", 1)
            count_per_page = args.get("count_per_page", 12)
        except Exception:
            return {"error":"args error"}
        try:
            
            user_id = uuid.UUID(get_jwt_identity())
            logger.info(f"user_id GET JWT {user_id}")
        except Exception:
            return {"error":"get_jwt_indentity error"}

        try:
            response, status = logic.list_decks(page, user_id, count_per_page)
            return response, status
        except Exception:
            return {"error":"endpoint response error"}


@decks_blp.route("/<uuid:id>")
class DeckItem(MethodView):
    """Retrieve, update, or delete one deck."""

    # READ
    @decks_blp.doc(description="Get a single deck by identifier")
    @jwt_required(["admin", "user"])
    def get(self, id):
        response, status = logic.get_deck_by_id(id)
        return response, status

    # UPDATE
    @decks_blp.arguments(DeckUpdate(partial=True))
    @decks_blp.doc(
        security=[{"Bearer": []}],
        description="Update a single deck by identifier"
    )
    @jwt_required(["admin"])
    def put(self, data, id):
        response, status = logic.update_deck(id, **data)
        return response, status

    # DELETE
    @decks_blp.doc(
        security=[{"Bearer": []}],
        description="Delete a single deck by identifier"
    )
    @jwt_required(["admin"])
    def delete(self, id):
        response, status = logic.delete_deck(id)
        return response, status
    
@decks_blp.route("/user/<uuid:user_id>")
class DecksByUser(MethodView):
    """Get all decks for a specific user ID."""

    @decks_blp.doc(
        security=[{"Bearer": []}],
        description="Get decks by user_id (admin-only or diagnostic)",
    )
    @jwt_required(["admin"])
    def get(self, user_id):
        try:
            page = 1
            count_per_page = 100  # or some high default
            logger.info(f"[ADMIN] Fetching decks for user_id: {user_id}")
            response, status = logic.list_decks(page, user_id, count_per_page)
            return response, status
        except Exception as e:
            logger.exception(f"[ADMIN] Error fetching decks for user_id: {user_id}")
            return {"error": f"Could not fetch decks for user_id {user_id}"}, 500

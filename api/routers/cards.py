from flask_smorest import Blueprint

cards_blp = Blueprint("cards", __name__, url_prefix="/api/cards", description="Cards operations")
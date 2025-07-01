from flask import Blueprint, jsonify
from api.db import engine
from api.models import Card
from api.logic import  create_tcg_card

Card.Base.metadata.create_all(bind=engine)
api_flask = Blueprint("api", __name__)

    
@api_flask.route("/import/<string:identifier>", methods=["POST"])
def import_pokemon(identifier):
    resp, status = create_tcg_card(identifier)
    return jsonify(resp), status

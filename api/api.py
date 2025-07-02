from flask import Blueprint, jsonify,request
from api.db import engine
from api.models import Card
from api import logic

Card.Base.metadata.create_all(bind=engine)
api_flask = Blueprint("api", __name__)

    
@api_flask.route("/import/<string:identifier>", methods=["POST"])
def import_pokemon(identifier):
    try:
        response, status = logic.create_tcg_card(identifier)
        return jsonify(response), status
    except Exception as error:
        return jsonify({"error": f"{error}"}), 400

@api_flask.route("/",methods=["GET"])
def list_cards():
    try:
        response,status = logic.list_cards()
        return jsonify(response),status
    except Exception as error:
        return jsonify({"error": f"{error}"}), 400

@api_flask.route("/<string:id>",methods=["GET"])
def get_card_by_id(id:int):
    try:
        response,status = logic.get_card_by_id(id)
        return jsonify(response),status
    except Exception as error:
        return jsonify({"error": f"{error}"}), 400

@api_flask.route("/update/<string:id>",methods=["PUT"])
def update_card(id):
    try:
        data = request.get_json()
        response,status = logic.update_card(id,**data)
        return jsonify(response),status
    except Exception as error:
        return jsonify({"error": f"{error}"}), 400
    
@api_flask.route("/delete/<string:id>",methods=["DELETE"])
def delete_card(id):
    try:
        response,status = logic.delete_card(id)
        return jsonify(response),status
    except Exception as error:
        return jsonify({"error": f"{error}"}), 400
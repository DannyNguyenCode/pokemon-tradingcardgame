import flask_smorest as Blueprint
from flask import request, make_response, jsonify
from flask.views import MethodView
from app.services import jwt_required
from . import auth_blp

@auth_blp.route("/test-auth-admin")
class TestAuth(MethodView):
    @auth_blp.doc(
            security=[{"Bearer": []}],
            description="Test JWT Authentication Endpoint for admin")
    @jwt_required(["admin"])
    def post(self):
        try:
            print("Test Admin Authentication Endpoint hit")
            # Simulate a successful authentication response
            response = make_response(jsonify({"message": "Authentication successful"}))
            return response, 200
        except Exception as e:
            return {"message": "Failed to authenticate"}, 500
        
@auth_blp.route("/test-auth-user")
class TestAuth(MethodView):
    @auth_blp.doc(
            security=[{"Bearer": []}],
            description="Test JWT Authentication Endpoint for user")
    @jwt_required(["user"])
    def post(self):
        try:
            # Simulate a successful authentication response
            response = make_response(jsonify({"message": "Authentication successful"}))
            return response, 200
        except Exception as e:
            return {"message": "Failed to authenticate"}, 500
        
@auth_blp.route("/test-auth-admin-user")
class TestAuth(MethodView):
    @auth_blp.doc(
            security=[{"Bearer": []}],
            description="Test JWT Authentication Endpoint for both admin and user")
    @jwt_required(["admin", "user"])
    def post(self):
        try:
            # Simulate a successful authentication response
            response = make_response(jsonify({"message": "Authentication successful"}))
            return response, 200
        except Exception as e:
            return {"message": "Failed to authenticate"}, 500
from flask.views import MethodView
from api.schemas import User
from api import logic
from . import auth_blp


@auth_blp.route("/register")
class RegisterUser(MethodView):
    @auth_blp.doc(description="Register new user ")
    @auth_blp.arguments(User)
    def post(self,data):
        try:
            response,status = logic.register_user(**data)
            return response,status         
        except Exception as e:
            return {"message":f"Failed to register user"},500
        

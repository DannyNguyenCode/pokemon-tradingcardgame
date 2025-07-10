from flask.views import MethodView
from api.schemas import LoginSchema
from api import logic
from . import auth_blp
from flask_smorest import abort


@auth_blp.route("/login")
class LoginUser(MethodView):
    @auth_blp.doc(description="Login User")
    @auth_blp.arguments(LoginSchema)
    def post(self, data):
        try:
            response, status = logic.login_user(**data)
            if status >= 400:
                abort(status, message=response.get("error"))
            return response, status
        except Exception as e:
            return {"message": f"Failed to login user user"}, 500

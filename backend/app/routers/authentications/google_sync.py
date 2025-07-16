from flask.views import MethodView
from app.schemas import GoogleAuthUser
from app import logic
from . import auth_blp
from flask_smorest import abort


@auth_blp.route("/google-sync")
class GoogleSync(MethodView):
    @auth_blp.doc(description="Google Sync")
    @auth_blp.arguments(GoogleAuthUser)
    def post(self, data):
        try:
            response, status = logic.google_sync(**data)
            if status >= 400:
                abort(status, message=response.get("error"))
            return response, status
        except Exception as e:
            return {"message": f"Failed to google sync"}, 500

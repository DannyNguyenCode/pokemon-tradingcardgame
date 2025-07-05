from flask_smorest  import Blueprint
from flask import request, make_response,jsonify
from flask.views import MethodView
from api.schemas import CookiesTheme
cookies_blp = Blueprint('theme',__name__,url_prefix="/api/authentications")


@cookies_blp.route("/set-theme")
class CookieSetThemes(MethodView):
    @cookies_blp.doc(
        description="Set a theme to be sent to front-end in a cookie"
    )
    @cookies_blp.arguments(CookiesTheme)
    def post(self,data):
        try:
            data = request.json.get("theme","light")
            response = make_response(jsonify({"theme":data}))
            response.set_cookie("theme",data,max_age=60*60*24*365,samesite="None",secure=True,httponly=False)
            return response
        except Exception as e:
            return {"message":f"Failed to generate cookie for setting theme"},500
# main.py
from flask import Flask
from flask_smorest import Api
from routers.cards import cards_blp  # adjust import path if needed

app = Flask(__name__)
app.config.update({
    "API_TITLE": "PokéTCG Catalog",
    "API_VERSION": "v1",
    "OPENAPI_VERSION": "3.0.3",
    "OPENAPI_URL_PREFIX": "/docs",
    "OPENAPI_SWAGGER_UI_PATH": "/swagger-ui",
    "OPENAPI_SWAGGER_UI_URL": "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
})
api = Api(app)
api.register_blueprint(cards_blp)

# Optional health-check
@app.route("/health")
def health():
    return {"status": "ok"}, 200

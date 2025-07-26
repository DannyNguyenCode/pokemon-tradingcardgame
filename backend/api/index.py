from app.routers.authentications import auth_blp
from app.routers.authentications.cookies import cookies_blp
from app.routers.cards import cards_blp
from app.routers.decks import decks_blp
from app.routers.deck_card import deck_cards_blp

from flask import Flask
from flask_smorest import Api
from flask_cors import CORS
import os


app = Flask(__name__)

# CORS SET UP with proper origin restrictions
# allowed_origins = os.getenv(
#     'ALLOWED_ORIGINS', 'http://localhost:3000,https://pokemon-tradingcardgame.vercel.app').split(',')

CORS(app,
     origins=["http://localhost:3000",
         "https://pokemon-tradingcardgame.vercel.app"],
     supports_credentials=True,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])
# 1) Load configuration
app.config.update({
    "API_TITLE": "PokéTCG Catalog",
    "API_VERSION": "v1",
    "OPENAPI_VERSION": "3.0.3",
    "OPENAPI_URL_PREFIX": "",
    "OPENAPI_SWAGGER_UI_PATH": "/docs",
    "OPENAPI_SWAGGER_UI_URL": "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
})

# 2) Initialize extensions
api = Api(app)
api.spec.components.security_scheme("Bearer", {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
})
# Import and register blueprints
from app.routers.cards import cards_blp
from app.routers.authentications.cookies import cookies_blp
from app.routers.authentications import auth_blp
from app.routers.decks import decks_blp
from app.routers.deck_card import deck_cards_blp
api.register_blueprint(cards_blp)
api.register_blueprint(cookies_blp)
api.register_blueprint(auth_blp)
api.register_blueprint(decks_blp)
api.register_blueprint(deck_cards_blp)

if __name__ == "__main__":
    # only used if you run "python main.py" locally
    app.run(port=5328, debug=True)

from flask_smorest import Api
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Configure CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:3000",
         "https://pokemon-tradingcardgame.vercel.app"])

    # Configure Flask-Smorest
    app.config["API_TITLE"] = "Pokemon Trading Card Game API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.2"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/docs"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    # Initialize API
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

    # Initialize database
    with app.app_context():
        from app.db import init_db
        init_db()

    return app

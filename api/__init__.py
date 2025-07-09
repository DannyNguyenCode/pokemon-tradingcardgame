from flask import Flask
from flask_smorest import Api
from flask_cors import CORS
def create_app(config_object=None):
    app = Flask(__name__)

    # CORS SET UP
    CORS(app, supports_credentials=True)
    # 1) Load configuration

    app.config.update({
    "API_TITLE": "PokéTCG Catalog",
    "API_VERSION": "v1",
    "OPENAPI_VERSION": "3.0.3",
    "OPENAPI_URL_PREFIX": "",
    "OPENAPI_SWAGGER_UI_PATH": "/docs",
    "OPENAPI_SWAGGER_UI_URL": "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    })

    if config_object:
        app.config.from_object(config_object)

    # 2) Initialize extensions
    api = Api(app)

    # 3) Register blueprints
    from api.routers.cards import cards_blp
    from api.routers.authentications.cookies import cookies_blp
    from api.routers.authentications import auth_blp
    api.register_blueprint(cards_blp)
    api.register_blueprint(cookies_blp)
    api.register_blueprint(auth_blp)

    return app

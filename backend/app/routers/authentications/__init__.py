
from flask_smorest import Blueprint

auth_blp = Blueprint(
    "auth",                     # unique blueprint name
    __name__,
    url_prefix="/api/authentications",
    description="Auth endpoints",
)

from . import login
from . import register
from . import google_sync
from . import auth_test
__all__ = ["auth_blp"]

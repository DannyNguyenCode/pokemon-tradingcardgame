import os
import bcrypt
from password_strength import PasswordPolicy, PasswordStats
import jwt
from dotenv import load_dotenv
from functools import wraps
from flask import request, jsonify, g


policy = PasswordPolicy.from_names(
    length=8,  # min length: 8
    uppercase=2,  # need min. 2 uppercase letters
    numbers=2,  # need min. 2 digits
    special=2,  # need min. 2 special characters
    # need min. 2 non-letter characters (digits, specials, anything)
    nonletters=2,
    strength=0.5,
)


def generate_response(message="", status=200, data=None, pagination=None):
    return {
        "status": status,
        "message": message,
        "data": data or {},
        "pagination": pagination or {},
    }


def hash_password(password: str):
    salt = bcrypt.gensalt(rounds=12)  # Use 12 rounds for production security
    hashed_password = bcrypt.hashpw(password.encode(), salt)
    return hashed_password.decode()


def check_password(password: str, hashed_password: str):
    return bcrypt.checkpw(password.encode(), hashed_password.encode())


def validate_password_strength(password: str):
    # Handle empty password first
    if not password:
        return "Password cannot be empty", 'violation'

    try:
        policy_test = policy.test(password)
        message = ""
        status = ''
        # Check if there are any policy violations
        if policy_test:
            if any(type(v).__name__.lower() == "Length".lower() for v in policy_test):
                message = "Password must be at least 8 characters long"
                status = 'violation'
            elif any(type(v).__name__.lower() == "Nonletters".lower() for v in policy_test):
                message = "Password must contain at least 2 non-letter characters"
                status = 'violation'
            elif any(type(v).__name__.lower() == "Special".lower() for v in policy_test):
                message = "Password must contain at least 2 special characters"
                status = 'violation'
            elif any(type(v).__name__.lower() == "Uppercase".lower() for v in policy_test):
                message = "Password must contain at least 2 uppercase letters"
                status = 'violation'

            elif any(type(v).__name__.lower() == "Numbers".lower() for v in policy_test):
                message = "Password must contain at least 2 numbers"
                status = 'violation'
            elif any(type(v).__name__.lower() == "Special".lower() for v in policy_test):
                message = "Password must contain at least 2 special characters"
                status = 'violation'
        # Check password strength if no policy violations
        if not message and status == 'info':
            stats = PasswordStats(password)
            if stats.strength() < 0.5:
                message = "Password is weak"
            elif stats.strength() < 0.75:
                message = "Password is medium"
            else:
                message = "Password is strong"

        return message, status
    except Exception as e:
        # Fallback error handling
        return f"Password validation error: {str(e)}", 'error'


SECRET = os.environ.get('NEXTAUTH_SECRET')


def jwt_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):

            auth_header = request.headers.get('Authorization', "")
            if not auth_header.startswith('Bearer '):
                return jsonify({"error": "Missing or invalid token"}), 401
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, SECRET, algorithms=['HS256'])
                g.user = payload
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
            except Exception as e:
                return jsonify({"error": str(e)}), 500

            user_role = g.user.get('role')
            if not user_role:
                return jsonify({"error": "User role not found"}), 401
            if user_role not in allowed_roles:
                return jsonify({"error": "Invalid role"}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_jwt_identity():
    try:
        if hasattr(g, "user") and isinstance(g.user, dict):
            return g.user.get("sub")
        return None
    except Exception:
        return {"error":"get_jwt_identitty error"}


def generate_pagination(page, total_count, count_per_page):
    page_size = count_per_page
    total_pages = (total_count + page_size - 1) // page_size
    has_next = page < total_pages
    has_prev = page > 1
    # Prepare pagination data
    pagination_data = {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev
    }
    return pagination_data

import bcrypt
from password_strength import PasswordPolicy, PasswordStats

policy = PasswordPolicy.from_names(
    length=8,  # min length: 8
    uppercase=2,  # need min. 2 uppercase letters
    numbers=2,  # need min. 2 digits
    special=2,  # need min. 2 special characters
    # need min. 2 non-letter characters (digits, specials, anything)
    nonletters=2,
    strength=0.5,
)


def generate_response(message="", status=200, data=None):
    return {
        "status": status,
        "message": message,
        "data": data or {},
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
        print("POLICY TEST", policy_test)
        message = ""
        status = ''
        # Check if there are any policy violations
        if policy_test:
            if any(type(v).__name__.lower() == "Length".lower() for v in policy_test):
                print("LENGTH")
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
        print("MESSAGE", message)
        print("STATUS", status)
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

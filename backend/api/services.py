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
    try:
        policy_test = policy.test(password)
        message = ""
        status = ''
        # Check if there are any policy violations
        if policy_test:
            # Get the first violation message
            violation = policy_test[0] if policy_test else None
            if violation:
                match str(violation):
                    case "length(8)":
                        message = "Password must be at least 8 characters long"
                        status = 'violation'
                    case "uppercase(2)":
                        message = "Password must contain at least 2 uppercase letters"
                        status = 'violation'
                    case "numbers(2)":
                        message = "Password must contain at least 2 numbers"
                        status = 'violation'
                    case "special(2)":
                        message = "Password must contain at least 2 special characters"
                        status = 'violation'
                    case "nonletters(2)":
                        message = "Password must contain at least 2 non-letter characters"
                        status = 'violation'
                    case _:
                        message = "Password is invalid"
                        status = 'violation'

        # Check password strength if no policy violations
        if not message:
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

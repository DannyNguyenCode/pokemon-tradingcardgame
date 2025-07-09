import bcrypt
def generate_response(message="", status=200, data=None):
    return {
        "status": status,
        "message": message,
        "data": data or {}, 
    }

def hash_password(password:str):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(),salt)
    return hashed_password.decode()

def check_password(password:str, hashed_password:str):
    return bcrypt.checkpw(password.encode(),hashed_password.encode())
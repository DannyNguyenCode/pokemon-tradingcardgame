def generate_response(message="", status=200, data=None):
    return {
        "status": status,
        "message": message,
        "data": data or {}, 
    }
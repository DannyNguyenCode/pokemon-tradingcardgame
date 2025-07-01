def generate_response(keys=None, values=None, message="", status=200, data=None):
    if data is None and keys and values:
        data = dict(zip(keys, values))
    elif data is None:
        data = {}

    return {
        "status": status,
        "message": message,
        **data
    }
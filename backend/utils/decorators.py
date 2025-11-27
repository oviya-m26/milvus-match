from functools import wraps

from flask import jsonify, request

from backend.models import User
from backend.utils.jwt import decode_token


def token_required(role: str | None = None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return (
                    jsonify({"msg": "Authorization header missing"}),
                    401,
                )
            token = auth_header.split(" ")[1]
            try:
                payload = decode_token(token)
                user = User.query.get(payload["sub"])
                if not user:
                    raise ValueError("User not found")
                if role and user.role != role:
                    return jsonify({"msg": "Insufficient permissions"}), 403
                request.user = user
            except Exception as exc:  # noqa: BLE001
                return jsonify({"msg": f"Invalid token: {exc}"}), 401
            return func(*args, **kwargs)

        return wrapper

    return decorator



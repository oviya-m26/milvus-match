from datetime import datetime
from typing import Any, Dict

import jwt
from flask import current_app


def create_token(payload: Dict[str, Any]) -> str:
    exp_delta = current_app.config["JWT_EXP_DELTA"]
    payload = {**payload, "exp": datetime.utcnow() + exp_delta}
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    return token


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=["HS256"],
        options={"require": ["exp"]},
    )



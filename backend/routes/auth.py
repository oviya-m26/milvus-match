from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from pydantic import ValidationError

from backend.extensions import bcrypt, db
from backend.models import User
from backend.schemas.auth import LoginSchema, RegisterSchema, UpdateUserSchema
from backend.services.embedding_service import encode_text
from backend.utils.decorators import token_required
from backend.utils.jwt import create_token
from backend.utils.responses import error_response, success_response


auth_bp = Blueprint("auth", __name__)


def _user_payload(user: User) -> dict:
    token = create_token({"sub": user.id, "role": user.role})
    return {"user": {**user.to_safe_dict(), "token": token}}


@auth_bp.post("/register")
def register():
    try:
        payload = RegisterSchema(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)

    if User.query.filter_by(email=payload.email).first():
        return error_response("Email already exists", 409)

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        role=payload.role,
        location=payload.location,
        state=payload.state,
        region=payload.region,
        social_category=payload.socialCategory,
        skills=payload.skills,
        preferences=payload.preferences,
    )
    user.password_hash = bcrypt.generate_password_hash(payload.password).decode("utf-8")
    if payload.resumeText:
        user.resume_text = payload.resumeText
        user.embedding = encode_text(payload.resumeText)
    elif payload.skills:
        combined = " ".join(payload.skills)
        user.embedding = encode_text(combined)

    db.session.add(user)
    db.session.commit()
    return success_response(_user_payload(user), 201)


@auth_bp.post("/login")
def login():
    try:
        payload = LoginSchema(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)

    user = User.query.filter_by(email=payload.email.lower()).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, payload.password):
        return error_response("Invalid credentials", 401)
    return success_response(_user_payload(user))


@auth_bp.patch("/updateUser")
@token_required()
def update_user():
    user: User = request.user
    try:
        payload = UpdateUserSchema(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)

    updates = payload.dict(exclude_unset=True)
    if "name" in updates:
        user.name = updates["name"]
    if "location" in updates:
        user.location = updates["location"]
    if "state" in updates:
        user.state = updates["state"]
    if "region" in updates:
        user.region = updates["region"]
    if "socialCategory" in updates:
        user.social_category = updates["socialCategory"]
    if "skills" in updates:
        user.skills = updates["skills"]
    if "preferences" in updates:
        user.preferences = updates["preferences"]
    if updates.get("resumeText"):
        user.resume_text = updates["resumeText"]
        user.embedding = encode_text(updates["resumeText"])
    if updates.get("avatar"):
        user.avatar_url = updates["avatar"]

    db.session.commit()
    return success_response(_user_payload(user))


@auth_bp.post("/uploadProfile")
@token_required()
def upload_profile():
    file = request.files.get("image")
    if not file:
        return error_response("Image file is required", 400)
    uploads_dir = Path(current_app.root_path).parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{request.user.id}_{file.filename}"
    file_path = uploads_dir / filename
    file.save(file_path)
    user: User = request.user
    user.avatar_url = f"/uploads/{filename}"
    db.session.commit()
    return jsonify({"image": {"src": user.avatar_url}})



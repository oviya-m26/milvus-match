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
    # Get raw request data first
    request_data = request.get_json() or {}
    
    # Validate with Pydantic (for email format validation)
    try:
        payload = RegisterSchema(**request_data)
    except ValidationError as err:
        return error_response(err.errors(), 422)
    except Exception as e:
        return error_response(f"Invalid request data: {str(e)}", 400)

    try:
        # Get required fields from request data (Pydantic 1.10.13 has issues with required fields)
        email = request_data.get("email")
        name = request_data.get("name")
        password = request_data.get("password")
        role = request_data.get("role", "applicant")
        
        if not email or not name or not password:
            return error_response("Missing required fields: name, email, password", 400)
        
        # Validate email format (Pydantic already did this, but double-check)
        if "@" not in email or "." not in email.split("@")[1]:
            return error_response("Invalid email format", 400)
        
        if User.query.filter_by(email=email.lower()).first():
            return error_response("Email already exists", 409)

        user = User(
            name=name,
            email=email.lower(),
            role=role,
            location=request_data.get("location") if request_data.get("location") else None,
            state=request_data.get("state") if request_data.get("state") else None,
            region=request_data.get("region") if request_data.get("region") else None,
            social_category=request_data.get("socialCategory") if request_data.get("socialCategory") else None,
            skills=request_data.get("skills", []) if request_data.get("skills") else [],
            preferences=request_data.get("preferences", {}) if request_data.get("preferences") else {},
        )
        user.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        if request_data.get("resumeText"):
            user.resume_text = request_data["resumeText"]
            user.embedding = encode_text(request_data["resumeText"])
        elif request_data.get("skills"):
            combined = " ".join(request_data["skills"])
            user.embedding = encode_text(combined)

        db.session.add(user)
        db.session.commit()
        return success_response(_user_payload(user), 201)
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        current_app.logger.error(f"Registration error: {error_msg}", exc_info=True)
        # Return a user-friendly error message
        if "UNIQUE constraint failed" in error_msg or "duplicate" in error_msg.lower():
            return error_response("Email already exists", 409)
        return error_response(f"Registration failed: {error_msg}", 500)


@auth_bp.post("/login")
def login():
    # Get raw request data first
    request_data = request.get_json() or {}
    
    # Validate with Pydantic (for email format validation)
    try:
        payload = LoginSchema(**request_data)
    except ValidationError as err:
        return error_response(err.errors(), 422)
    except Exception as e:
        return error_response(f"Invalid request data: {str(e)}", 400)

    try:
        # Get email and password from request data (Pydantic 1.10.13 has issues with required fields)
        email = request_data.get("email")
        password = request_data.get("password")
        
        if not email or not password:
            return error_response("Email and password are required", 400)
        
        user = User.query.filter_by(email=email.lower()).first()
        if not user:
            return error_response("Invalid credentials", 401)
        
        if not bcrypt.check_password_hash(user.password_hash, password):
            return error_response("Invalid credentials", 401)
        
        return success_response(_user_payload(user))
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}", exc_info=True)
        return error_response(f"Login failed: {str(e)}", 500)


@auth_bp.patch("/updateUser")
@token_required()
def update_user():
    user: User = request.user
    try:
        payload = UpdateUserSchema(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)

    updates = payload.dict(exclude_unset=True)
    if "name" in updates and updates["name"]:
        user.name = updates["name"]
    if "location" in updates:
        user.location = updates["location"] if updates["location"] else None
    if "state" in updates:
        user.state = updates["state"] if updates["state"] else None
    if "region" in updates:
        user.region = updates["region"] if updates["region"] else None
    if "socialCategory" in updates:
        user.social_category = updates["socialCategory"] if updates["socialCategory"] else None
    if "skills" in updates:
        user.skills = updates["skills"] if updates["skills"] else []
    if "preferences" in updates:
        user.preferences = updates["preferences"] if updates["preferences"] else {}
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



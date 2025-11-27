import uuid
from datetime import datetime

from backend.extensions import db


class BaseModel(db.Model):
    """Abstract base mixin for all tables."""

    __abstract__ = True

    id = db.Column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )



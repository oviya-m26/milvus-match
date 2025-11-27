from backend.extensions import db
from backend.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="applicant")
    location = db.Column(db.String(120))
    state = db.Column(db.String(120))
    region = db.Column(db.String(120))
    social_category = db.Column(db.String(60))
    skills = db.Column(db.JSON, default=list)
    preferences = db.Column(db.JSON, default=dict)
    resume_text = db.Column(db.Text)
    resume_url = db.Column(db.String(255))
    avatar_url = db.Column(db.String(255))
    vector_id = db.Column(db.String(64))
    embedding = db.Column(db.PickleType)

    jobs = db.relationship("Job", backref="employer", lazy=True)
    applications = db.relationship("Application", backref="candidate", lazy=True)

    def to_safe_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "location": self.location,
            "state": self.state,
            "region": self.region,
            "socialCategory": self.social_category,
            "skills": self.skills or [],
            "preferences": self.preferences or {},
            "resumeUrl": self.resume_url,
            "avatar": self.avatar_url,
            "resumeText": self.resume_text,
        }



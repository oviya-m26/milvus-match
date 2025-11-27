from backend.extensions import db
from backend.models.base import BaseModel


class Application(BaseModel):
    __tablename__ = "applications"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.String(36), db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(40), default="pending")
    match_score = db.Column(db.Float)
    justification = db.Column(db.Text)
    match_metadata = db.Column("metadata", db.JSON, default=dict)

    __table_args__ = (db.UniqueConstraint("user_id", "job_id", name="uq_user_job"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "jobId": self.job_id,
            "status": self.status,
            "matchScore": self.match_score,
            "justification": self.justification,
            "metadata": self.match_metadata or {},
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }



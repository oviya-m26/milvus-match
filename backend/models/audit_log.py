from backend.extensions import db
from backend.models.base import BaseModel


class AllocationAudit(BaseModel):
    __tablename__ = "allocation_audits"

    user_id = db.Column(db.String(36), nullable=False)
    job_id = db.Column(db.String(36), nullable=False)
    score = db.Column(db.Float, nullable=False)
    reasons = db.Column(db.JSON, default=list)
    social_category = db.Column(db.String(60))
    region = db.Column(db.String(120))
    quota_snapshot = db.Column(db.JSON, default=dict)
    vector_score = db.Column(db.Float)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "jobId": self.job_id,
            "score": self.score,
            "reasons": self.reasons or [],
            "socialCategory": self.social_category,
            "region": self.region,
            "quotaSnapshot": self.quota_snapshot or {},
            "vectorScore": self.vector_score,
            "createdAt": self.created_at.isoformat(),
        }









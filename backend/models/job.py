from backend.extensions import db
from backend.models.base import BaseModel


class Job(BaseModel):
    __tablename__ = "jobs"

    employer_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    position = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    job_location = db.Column(db.String(160), nullable=False)
    job_type = db.Column(db.String(50), default="full-time")
    status = db.Column(db.String(50), default="pending")
    job_description = db.Column(db.Text)
    image = db.Column(db.String(255))
    tags = db.Column(db.JSON, default=list)
    reservation_quota = db.Column(db.JSON, default=dict)
    skills_required = db.Column(db.JSON, default=list)
    state_priority = db.Column(db.String(120))
    capacity = db.Column(db.Integer, default=1)
    salary = db.Column(db.String(50))
    application_deadline = db.Column(db.DateTime)
    vector_id = db.Column(db.String(64))
    embedding = db.Column(db.PickleType)

    applications = db.relationship("Application", backref="job", lazy=True)

    def to_dict(self) -> dict:
        return {
            "_id": self.id,
            "company": self.company,
            "image": self.image,
            "jobLocation": self.job_location,
            "jobType": self.job_type,
            "position": self.position,
            "status": self.status,
            "jobDescription": self.job_description,
            "createdAt": self.created_at.isoformat(),
            "skillsRequired": self.skills_required or [],
            "reservationQuota": self.reservation_quota or {},
            "capacity": self.capacity,
            "statePriority": self.state_priority,
            "applicationDeadline": self.application_deadline.isoformat()
            if self.application_deadline
            else None,
            "salary": self.salary,
        }



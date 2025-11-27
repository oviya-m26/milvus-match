from datetime import datetime
from typing import Dict, List, Optional

from backend.extensions import db
from sqlalchemy.dialects.postgresql import JSONB

class Internship(db.Model):
    """Model representing an internship opportunity."""
    
    __tablename__ = 'internships'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    duration = db.Column(db.String(50), nullable=True)  # e.g., "3 months", "6 months"
    stipend = db.Column(db.String(100), nullable=True)  # Could be a range like "5000-10000"
    requirements = db.Column(JSONB, default=list)  # List of requirements
    skills = db.Column(JSONB, default=list)  # List of required skills
    category = db.Column(db.String(50), default='general')  # e.g., 'government', 'private', 'startup'
    source = db.Column(db.String(100), nullable=False)  # Source of the internship
    external_id = db.Column(db.String(100), nullable=True)  # ID from external source
    is_government = db.Column(db.Boolean, default=False)
    quota_details = db.Column(JSONB, default=dict)  # Quota information
    
    # Embedding for semantic search
    embedding = db.Column(db.ARRAY(db.Float), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='internship', lazy=True)
    
    def to_dict(self) -> Dict:
        """Convert internship to dictionary representation."""
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'description': self.description,
            'location': self.location,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'duration': self.duration,
            'stipend': self.stipend,
            'requirements': self.requirements,
            'skills': self.skills,
            'category': self.category,
            'source': self.source,
            'is_government': self.is_government,
            'quota_details': self.quota_details,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Internship {self.title} at {self.company}>"

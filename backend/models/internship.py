# backend/models/internship.py
from datetime import datetime
from typing import Dict, List, Optional
from flask_sqlalchemy import SQLAlchemy
import json
import uuid  # Added for UUID generation

# Initialize SQLAlchemy
db = SQLAlchemy()

class Internship(db.Model):
    """Model representing an internship opportunity."""
    
    __tablename__ = 'internships'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    stipend = db.Column(db.String(100), nullable=True)
    requirements = db.Column(db.Text, default='[]')  # Store as JSON string
    skills = db.Column(db.Text, default='[]')  # Store as JSON string
    category = db.Column(db.String(50), default='general')
    posted_date = db.Column(db.DateTime, default=datetime.utcnow)
    application_deadline = db.Column(db.DateTime, nullable=True)

    # Helper methods to handle JSON fields
    def set_requirements(self, requirements_list):
        self.requirements = json.dumps(requirements_list)
    
    def get_requirements(self):
        return json.loads(self.requirements)
    
    def set_skills(self, skills_list):
        self.skills = json.dumps(skills_list)
    
    def get_skills(self):
        return json.loads(self.skills)
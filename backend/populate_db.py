# backend/populate_db.py
import os
import sys
import uuid
from datetime import datetime, timedelta

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from models.internship import Internship
import json

def create_sample_internships():
    sample_internships = [
        {
            "id": str(uuid.uuid4()),
            "title": "Software Engineering Intern",
            "company": "Tech Corp",
            "description": "Work on cutting-edge web applications using React and Python.",
            "requirements": json.dumps(["Python", "React", "JavaScript", "REST APIs"]),
            "skills": json.dumps(["Python", "React", "JavaScript", "Web Development"]),
            "location": "Remote",
            "stipend": "25000",
            "duration": "3 months",
            "category": "Software Development",
            "posted_date": datetime.utcnow(),
            "application_deadline": datetime.utcnow() + timedelta(days=30)
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Data Science Intern",
            "company": "Data Insights Inc",
            "description": "Analyze large datasets and build machine learning models.",
            "requirements": json.dumps(["Python", "Pandas", "Scikit-learn", "Data Analysis"]),
            "skills": json.dumps(["Machine Learning", "Data Analysis", "Python", "Statistics"]),
            "location": "Bangalore, India",
            "stipend": "30000",
            "duration": "6 months",
            "category": "Data Science",
            "posted_date": datetime.utcnow(),
            "application_deadline": datetime.utcnow() + timedelta(days=45)
        }
    ]

    app = create_app()
    with app.app_context():
        # Create database tables if they don't exist
        db.create_all()
        
        # Add sample internships
        for data in sample_internships:
            try:
                internship = Internship(**data)
                db.session.add(internship)
                print(f"Added internship: {internship.title} at {internship.company}")
            except Exception as e:
                print(f"Error adding internship {data.get('title')}: {str(e)}")
        
        db.session.commit()
        print("\nSuccessfully populated the database with sample internships!")

if __name__ == "__main__":
    print("Starting to populate the database with sample data...")
    create_sample_internships()
    print("Done!")
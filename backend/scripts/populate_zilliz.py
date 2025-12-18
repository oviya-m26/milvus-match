import os
import sys
from datetime import datetime, timedelta

# Add the project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from app import create_app, db
from models.internship import Internship
from services.internship_service import internship_service

def create_sample_internships():
    sample_internships = [
        {
            "title": "Software Engineering Intern",
            "company": "Tech Corp",
            "description": "Work on cutting-edge web applications using React and Python. You'll be part of a team developing scalable solutions for our clients.",
            "requirements": ["Python", "React", "JavaScript", "REST APIs"],
            "skills": ["Python", "React", "JavaScript", "Web Development"],
            "location": "Remote",
            "source": "sample",
            "external_id": "sample_1",
            "posted_date": datetime.utcnow().isoformat(),
            "application_deadline": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "stipend": 25000,
            "duration": "3 months",
            "category": "Software Development"
        },
        {
            "title": "Data Science Intern",
            "company": "Data Insights Inc",
            "description": "Analyze large datasets and build machine learning models to solve real-world problems. Work with our data science team on exciting projects.",
            "requirements": ["Python", "Pandas", "Scikit-learn", "Data Analysis"],
            "skills": ["Machine Learning", "Data Analysis", "Python", "Statistics"],
            "location": "Bangalore, India",
            "source": "sample",
            "external_id": "sample_2",
            "posted_date": datetime.utcnow().isoformat(),
            "application_deadline": (datetime.utcnow() + timedelta(days=45)).isoformat(),
            "stipend": 30000,
            "duration": "6 months",
            "category": "Data Science"
        },
        {
            "title": "Frontend Developer Intern",
            "company": "WebCraft Solutions",
            "description": "Build beautiful and responsive user interfaces using modern web technologies. Work with our design and backend teams to create seamless user experiences.",
            "requirements": ["HTML", "CSS", "JavaScript", "React"],
            "skills": ["Frontend Development", "UI/UX", "React", "CSS"],
            "location": "Mumbai, India",
            "source": "sample",
            "external_id": "sample_3",
            "posted_date": datetime.utcnow().isoformat(),
            "application_deadline": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "stipend": 20000,
            "duration": "3 months",
            "category": "Web Development"
        }
    ]

    app = create_app()
    with app.app_context():
        # Create database tables if they don't exist
        db.create_all()
        
        # Add sample internships
        for data in sample_internships:
            try:
                internship = internship_service.process_internship_data(data)
                print(f"Added internship: {internship.title} at {internship.company}")
            except Exception as e:
                print(f"Error adding internship {data.get('title')}: {str(e)}")
        
        print("\nSuccessfully populated Zilliz with sample internships!")

if __name__ == "__main__":
    print("Starting to populate Zilliz with sample data...")
    create_sample_internships()
    print("Done!")

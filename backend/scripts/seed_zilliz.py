import os
from datetime import datetime, timedelta

from backend.app import create_app
from backend.models import db, Internship
from backend.services.internship_service import internship_service

def create_sample_internships():
    sample_internships = [
        {
            "title": "Software Engineering Intern",
            "company": "Tech Corp",
            "description": "Work on cutting-edge web applications using React and Python.",
            "requirements": ["Python", "React", "JavaScript"],
            "skills": ["Python", "React", "REST APIs"],
            "location": "Remote",
            "source": "sample",
            "external_id": "sample_1",
            "posted_date": datetime.utcnow().isoformat(),
            "application_deadline": (datetime.utcnow() + timedelta(days=30)).isoformat()
        },
        {
            "title": "Data Science Intern",
            "company": "Data Insights Inc",
            "description": "Analyze large datasets and build machine learning models.",
            "requirements": ["Python", "Pandas", "Scikit-learn"],
            "skills": ["Machine Learning", "Data Analysis", "Python"],
            "location": "Bangalore, India",
            "source": "sample",
            "external_id": "sample_2",
            "posted_date": datetime.utcnow().isoformat(),
            "application_deadline": (datetime.utcnow() + timedelta(days=45)).isoformat()
        }
    ]

    for data in sample_internships:
        try:
            internship_service.process_internship_data(data)
            print(f"Processed internship: {data['title']} at {data['company']}")
        except Exception as e:
            print(f"Error processing {data.get('title')}: {str(e)}")
    
    db.session.commit()
    print(f"Successfully added {len(sample_internships)} sample internships to Zilliz")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        create_sample_internships()

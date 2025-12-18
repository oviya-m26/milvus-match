"""Create sample jobs for testing."""
from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import Job, User
from datetime import datetime, timedelta


def ensure_system_employer() -> User:
    """Create or fetch a system employer used for sample jobs."""
    email = "system@milvusmatch.in"
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(
        name="System Employer",
        email=email,
        role="employer",
        location="India",
    )
    user.password_hash = bcrypt.generate_password_hash("ChangeMe!123").decode("utf-8")
    db.session.add(user)
    db.session.commit()
    return user


def create_sample_jobs():
    """Create sample internship jobs."""
    employer = ensure_system_employer()
    
    sample_jobs = [
        {
            "position": "Software Development Intern",
            "company": "TechCorp India",
            "job_location": "Bangalore, Karnataka",
            "job_type": "internship",
            "job_description": "Join our dynamic software development team. Work on cutting-edge web applications using React, Node.js, and Python. Gain hands-on experience in full-stack development.",
            "skills_required": ["Python", "JavaScript", "React", "Node.js", "SQL"],
            "salary": "₹25,000 - ₹35,000 / month",
            "capacity": 5,
            "state_priority": "Karnataka",
        },
        {
            "position": "Data Science Intern",
            "company": "DataAnalytics Pro",
            "job_location": "Mumbai, Maharashtra",
            "job_type": "internship",
            "job_description": "Analyze large datasets and build machine learning models. Work with Python, pandas, scikit-learn, and TensorFlow. Perfect for students interested in AI/ML.",
            "skills_required": ["Python", "Machine Learning", "Pandas", "NumPy", "Data Analysis"],
            "salary": "₹30,000 - ₹40,000 / month",
            "capacity": 3,
            "state_priority": "Maharashtra",
        },
        {
            "position": "Marketing Intern",
            "company": "Digital Marketing Solutions",
            "job_location": "Delhi, Delhi",
            "job_type": "internship",
            "job_description": "Help create and execute digital marketing campaigns. Work on social media, content creation, SEO, and analytics. Great for creative minds.",
            "skills_required": ["Marketing", "Social Media", "Content Writing", "SEO", "Analytics"],
            "salary": "₹15,000 - ₹25,000 / month",
            "capacity": 4,
            "state_priority": "Delhi",
        },
        {
            "position": "UI/UX Design Intern",
            "company": "Design Studio India",
            "job_location": "Hyderabad, Telangana",
            "job_type": "internship",
            "job_description": "Design beautiful and intuitive user interfaces. Work with Figma, Adobe XD, and user research. Learn design thinking and prototyping.",
            "skills_required": ["Figma", "UI/UX Design", "Adobe XD", "Prototyping", "User Research"],
            "salary": "₹20,000 - ₹30,000 / month",
            "capacity": 2,
            "state_priority": "Telangana",
        },
        {
            "position": "Backend Development Intern",
            "company": "CloudTech Solutions",
            "job_location": "Pune, Maharashtra",
            "job_type": "internship",
            "job_description": "Build scalable backend systems using Python, Django, and PostgreSQL. Learn about APIs, microservices, and cloud deployment.",
            "skills_required": ["Python", "Django", "PostgreSQL", "REST APIs", "Docker"],
            "salary": "₹28,000 - ₹38,000 / month",
            "capacity": 3,
            "state_priority": "Maharashtra",
        },
        {
            "position": "Mobile App Development Intern",
            "company": "AppDev India",
            "job_location": "Chennai, Tamil Nadu",
            "job_type": "internship",
            "job_description": "Develop mobile applications for iOS and Android. Work with React Native, Flutter, or native development. Build apps from concept to deployment.",
            "skills_required": ["React Native", "Flutter", "Mobile Development", "JavaScript", "API Integration"],
            "salary": "₹22,000 - ₹32,000 / month",
            "capacity": 4,
            "state_priority": "Tamil Nadu",
        },
    ]
    
    created = 0
    for job_data in sample_jobs:
        # Check if job already exists
        existing = Job.query.filter_by(
            position=job_data["position"],
            company=job_data["company"],
            employer_id=employer.id
        ).first()
        
        if existing:
            continue
            
        job = Job(
            employer_id=employer.id,
            position=job_data["position"],
            company=job_data["company"],
            job_location=job_data["job_location"],
            job_type=job_data["job_type"],
            status="pending",
            job_description=job_data["job_description"],
            skills_required=job_data["skills_required"],
            salary=job_data["salary"],
            capacity=job_data["capacity"],
            state_priority=job_data["state_priority"],
            application_deadline=datetime.utcnow() + timedelta(days=30),
        )
        db.session.add(job)
        created += 1
    
    db.session.commit()
    return created


def main():
    app = create_app()
    with app.app_context():
        count = create_sample_jobs()
        total = Job.query.count()
        print(f"Created {count} new sample jobs. Total jobs in database: {total}")


if __name__ == "__main__":
    main()




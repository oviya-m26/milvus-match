"""Create many diverse sample jobs for testing."""
import random
from datetime import datetime, timedelta

from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import Job, User


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


# Diverse job templates
COMPANIES = [
    "TechCorp India", "DataAnalytics Pro", "Digital Marketing Solutions", "Design Studio India",
    "CloudTech Solutions", "AppDev India", "FinTech Innovations", "EduTech Solutions",
    "HealthTech India", "GreenEnergy Corp", "RetailTech Solutions", "MediaHouse India",
    "StartupHub", "Innovation Labs", "SmartCity Tech", "AgriTech Solutions",
    "Logistics Pro", "HR Solutions", "LegalTech India", "RealEstate Tech",
    "TravelTech", "FoodTech India", "FashionTech", "SportsTech",
    "Gaming Studios", "AI Research Labs", "Blockchain Solutions", "Cybersecurity Pro",
    "IoT Solutions", "Robotics India", "SpaceTech", "Biotech Innovations"
]

POSITIONS = [
    "Software Development Intern", "Data Science Intern", "Marketing Intern", "UI/UX Design Intern",
    "Backend Development Intern", "Mobile App Development Intern", "Frontend Development Intern",
    "DevOps Intern", "Cloud Engineering Intern", "Machine Learning Intern", "AI Research Intern",
    "Product Management Intern", "Business Development Intern", "Sales Intern", "Content Writing Intern",
    "Graphic Design Intern", "Video Editing Intern", "Social Media Intern", "SEO Intern",
    "Digital Marketing Intern", "Finance Intern", "HR Intern", "Operations Intern",
    "Quality Assurance Intern", "Cybersecurity Intern", "Blockchain Developer Intern",
    "IoT Development Intern", "Robotics Intern", "Data Analyst Intern", "Business Analyst Intern"
]

LOCATIONS = [
    ("Bangalore", "Karnataka"), ("Mumbai", "Maharashtra"), ("Delhi", "Delhi"),
    ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"), ("Pune", "Maharashtra"),
    ("Kolkata", "West Bengal"), ("Ahmedabad", "Gujarat"), ("Jaipur", "Rajasthan"),
    ("Lucknow", "Uttar Pradesh"), ("Chandigarh", "Punjab"), ("Indore", "Madhya Pradesh"),
    ("Bhopal", "Madhya Pradesh"), ("Coimbatore", "Tamil Nadu"), ("Kochi", "Kerala"),
    ("Nagpur", "Maharashtra"), ("Visakhapatnam", "Andhra Pradesh"), ("Patna", "Bihar"),
    ("Ludhiana", "Punjab"), ("Agra", "Uttar Pradesh"), ("Varanasi", "Uttar Pradesh"),
    ("Surat", "Gujarat"), ("Kanpur", "Uttar Pradesh"), ("Nashik", "Maharashtra")
]

SKILLS_SETS = [
    ["Python", "JavaScript", "React", "Node.js", "SQL"],
    ["Python", "Machine Learning", "Pandas", "NumPy", "Data Analysis"],
    ["Marketing", "Social Media", "Content Writing", "SEO", "Analytics"],
    ["Figma", "UI/UX Design", "Adobe XD", "Prototyping", "User Research"],
    ["Python", "Django", "PostgreSQL", "REST APIs", "Docker"],
    ["React Native", "Flutter", "Mobile Development", "JavaScript", "API Integration"],
    ["Java", "Spring Boot", "Microservices", "Kubernetes", "AWS"],
    ["C++", "Game Development", "Unity", "Unreal Engine", "3D Modeling"],
    ["Go", "Distributed Systems", "gRPC", "Kafka", "Redis"],
    ["Rust", "Systems Programming", "Blockchain", "Cryptography", "WebAssembly"],
    ["Swift", "iOS Development", "Xcode", "Core Data", "UIKit"],
    ["Kotlin", "Android Development", "Jetpack", "Room Database", "Material Design"],
    ["TypeScript", "Angular", "RxJS", "NgRx", "Testing"],
    ["Vue.js", "Nuxt.js", "Vuex", "GraphQL", "Apollo"],
    ["PHP", "Laravel", "MySQL", "Redis", "Elasticsearch"],
    ["Ruby", "Rails", "PostgreSQL", "Sidekiq", "RSpec"],
    ["C#", ".NET", "ASP.NET", "Entity Framework", "Azure"],
    ["Scala", "Spark", "Hadoop", "Kafka", "Cassandra"],
    ["R", "Statistical Analysis", "Data Visualization", "Shiny", "ggplot2"],
    ["MATLAB", "Simulink", "Signal Processing", "Image Processing", "Control Systems"]
]

DESCRIPTIONS = [
    "Join our dynamic team and work on cutting-edge projects. Gain hands-on experience in a fast-paced environment.",
    "Excellent opportunity to learn from industry experts and contribute to real-world projects.",
    "Work on innovative solutions and make a real impact. Perfect for students looking to build their career.",
    "Collaborate with talented professionals and develop skills that will set you apart in the job market.",
    "Be part of a growing team and help shape the future of technology. Mentorship and guidance provided.",
    "Exciting internship opportunity with exposure to latest technologies and industry best practices.",
    "Learn by doing! Work on live projects and gain practical experience in your field of interest.",
    "Join a supportive team environment where your ideas matter. Great learning and growth opportunities.",
    "Work on challenging problems and develop solutions that make a difference. Flexible work arrangements.",
    "Perfect for ambitious students ready to take on responsibility and grow their professional network."
]


def create_many_jobs(count: int = 100):
    """Create many diverse sample jobs."""
    employer = ensure_system_employer()
    
    created = 0
    for i in range(count):
        city, state = random.choice(LOCATIONS)
        position = random.choice(POSITIONS)
        company = random.choice(COMPANIES)
        skills = random.choice(SKILLS_SETS)
        description = random.choice(DESCRIPTIONS)
        
        # Check if similar job exists
        existing = Job.query.filter_by(
            position=position,
            company=company,
            employer_id=employer.id
        ).first()
        
        if existing:
            continue
        
        # Generate salary range
        base_salary = random.randint(15000, 40000)
        salary_range = f"₹{base_salary:,} - ₹{base_salary + random.randint(5000, 15000):,} / month"
        
        created_at = datetime.utcnow() - timedelta(days=random.randint(1, 90))
        job = Job(
            employer_id=employer.id,
            position=position,
            company=company,
            job_location=f"{city}, {state}",
            job_type="internship",
            status="pending",
            job_description=description,
            skills_required=skills,
            salary=salary_range,
            capacity=random.randint(1, 5),
            state_priority=state,
            application_deadline=datetime.utcnow() + timedelta(days=random.randint(15, 60)),
            created_at=created_at,
        )
        
        db.session.add(job)
        created += 1
        
        # Commit in batches
        if created % 50 == 0:
            db.session.commit()
            print(f"Created {created} jobs...")
    
    db.session.commit()
    return created


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create many sample jobs.")
    parser.add_argument(
        "--count",
        type=int,
        default=100,
        help="Number of jobs to create (default: 100)",
    )
    args = parser.parse_args()
    
    app = create_app()
    with app.app_context():
        print(f"Creating {args.count} diverse sample jobs...")
        created = create_many_jobs(args.count)
        total = Job.query.count()
        print(f"\n✓ Created {created} new jobs")
        print(f"✓ Total jobs in database: {total}")


if __name__ == "__main__":
    main()







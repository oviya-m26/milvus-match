"""Load jobs from CSV file without pandas dependency."""
import csv
from datetime import datetime, timedelta
from pathlib import Path

from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import Job, User


def ensure_system_employer() -> User:
    """Create or fetch a system employer used for imported jobs."""
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


def parse_skills(raw: str) -> list:
    """Parse skills from string."""
    if not raw or raw.lower() in ["nan", "none", ""]:
        return []
    # Handle different formats
    if "|" in raw:
        return [s.strip() for s in raw.split("|") if s.strip()]
    if "," in raw:
        return [s.strip().strip("[]\"'") for s in raw.split(",") if s.strip()]
    return [raw.strip()] if raw.strip() else []


def parse_location(row: dict) -> str:
    """Parse location from row."""
    parts = []
    for key in ["location_city", "location_state", "location_country"]:
        if key in row and row[key] and str(row[key]).lower() not in ["nan", "none", ""]:
            parts.append(str(row[key]))
    return ", ".join(parts) if parts else "India"


def parse_salary(row: dict) -> str:
    """Parse salary from row."""
    min_val = row.get("stipend_min_inr", "")
    max_val = row.get("stipend_max_inr", "")
    
    try:
        if min_val and str(min_val).lower() not in ["nan", "none", ""]:
            min_int = int(float(str(min_val)))
            if max_val and str(max_val).lower() not in ["nan", "none", ""]:
                max_int = int(float(str(max_val)))
                return f"₹{min_int} - ₹{max_int} / month"
            return f"₹{min_int} / month"
    except (ValueError, TypeError):
        pass
    return "₹15,000 - ₹30,000 / month"  # Default


def load_jobs_from_csv(csv_path: Path, limit: int = None):
    """Load jobs from CSV file."""
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    employer = ensure_system_employer()
    created = 0
    skipped = 0
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            if limit and idx >= limit:
                break
            
            # Get required fields
            listing_id = str(row.get("listing_id", "")).strip()
            title = str(row.get("title", "")).strip()
            company = str(row.get("company_name", "")).strip()
            
            if not listing_id or listing_id.lower() in ["nan", "none", ""]:
                listing_id = f"job_{idx}_{int(datetime.utcnow().timestamp())}"
            
            if not title or title.lower() in ["nan", "none", ""]:
                title = "Internship Opportunity"
            
            if not company or company.lower() in ["nan", "none", ""]:
                company = "Company"
            
            # Check if job already exists
            existing = Job.query.filter_by(
                position=title,
                company=company,
                employer_id=employer.id
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Create job
            job = Job(
                id=listing_id if len(listing_id) < 36 else None,  # Use custom ID if valid, otherwise auto-generate
                employer_id=employer.id,
                position=title,
                company=company,
                job_location=parse_location(row),
                job_type="internship",
                status="pending",
                job_description=str(row.get("description", "")).strip() or f"Internship opportunity at {company}",
                skills_required=parse_skills(str(row.get("skills", ""))),
                salary=parse_salary(row),
                capacity=1,
                state_priority=str(row.get("location_state", "")).strip() or None,
                application_deadline=datetime.utcnow() + timedelta(days=30),
            )
            
            # Add tags
            tags = []
            if row.get("category"):
                tags.append(str(row.get("category")))
            if row.get("source"):
                tags.append(str(row.get("source")))
            job.tags = tags
            
            db.session.add(job)
            created += 1
            
            # Commit in batches
            if created % 50 == 0:
                db.session.commit()
                print(f"Loaded {created} jobs...")
    
    db.session.commit()
    return created, skipped


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Load jobs from CSV file.")
    parser.add_argument(
        "--csv",
        default=str(Path(__file__).resolve().parents[2] / "cursor-internship-ingest" / "data" / "clean" / "listings.csv"),
        help="Path to listings CSV file.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of jobs to load (default: all)",
    )
    args = parser.parse_args()
    
    csv_path = Path(args.csv)
    
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        print("Please provide a valid path to listings.csv")
        return
    
    app = create_app()
    with app.app_context():
        print(f"Loading jobs from {csv_path}...")
        created, skipped = load_jobs_from_csv(csv_path, limit=args.limit)
        total = Job.query.count()
        print(f"\n✓ Created {created} new jobs")
        print(f"✓ Skipped {skipped} duplicate jobs")
        print(f"✓ Total jobs in database: {total}")


if __name__ == "__main__":
    main()







import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import pandas as pd

from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import Job, User


def ensure_system_employer() -> User:
    """Create or fetch a system employer used for imported jobs."""
    email = "ingest@milvusmatch.in"
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(
        name="Ingest Bot",
        email=email,
        role="employer",
        location="India",
    )
    user.password_hash = bcrypt.generate_password_hash("ChangeMe!123").decode("utf-8")
    db.session.add(user)
    db.session.commit()
    return user


def parse_skills(raw: Optional[str]) -> List[str]:
    if not raw or pd.isna(raw):
        return []
    if isinstance(raw, list):
        return [str(item).strip() for item in raw if str(item).strip()]
    if isinstance(raw, str):
        parts = [part.strip(" []\"'") for part in raw.replace("|", ",").split(",")]
        return [part for part in parts if part]
    return []


def parse_location(row: pd.Series) -> str:
    parts = [row.get("location_city"), row.get("location_state"), row.get("location_country")]
    return ", ".join([str(part) for part in parts if part and str(part) != "nan"])


def parse_salary(row: pd.Series) -> Optional[str]:
    min_value = row.get("stipend_min_inr")
    max_value = row.get("stipend_max_inr")
    if pd.isna(min_value) and pd.isna(max_value):
        return None
    if pd.isna(max_value):
        return f"₹{int(min_value)} / month"
    return f"₹{int(min_value)} - ₹{int(max_value)} / month"


def import_listings(clean_dir: Path):
    listings_path = clean_dir / "listings.csv"
    if not listings_path.exists():
        raise FileNotFoundError(f"{listings_path} not found. Run the ingest pipeline first.")

    df = pd.read_csv(listings_path)
    employer = ensure_system_employer()

    for _, row in df.iterrows():
        listing_id = str(row.get("listing_id"))
        if not listing_id or listing_id == "nan":
            continue
        job = Job.query.get(listing_id)
        if not job:
            job = Job(id=listing_id, employer_id=employer.id)
            db.session.add(job)

        job.position = row.get("title") or "Internship"
        job.company = row.get("company_name") or "Unknown"
        job.job_location = parse_location(row) or "India"
        job.job_type = "internship"
        job.status = "pending"
        job.job_description = row.get("description") or ""
        job.tags = [tag for tag in [row.get("category"), row.get("source")] if isinstance(tag, str)]
        job.skills_required = parse_skills(row.get("skills"))
        job.state_priority = row.get("location_state") or None
        if not pd.isna(row.get("duration_weeks")):
            job.capacity = int(row.get("duration_weeks"))
        job.salary = parse_salary(row)
        posted = row.get("posted_date")
        if isinstance(posted, str) and posted:
            try:
                job.application_deadline = datetime.fromisoformat(posted)
            except ValueError:
                job.application_deadline = None
        else:
            job.application_deadline = None

    db.session.commit()


def main():
    parser = argparse.ArgumentParser(description="Load cleaned ingestion data into the Flask backend database.")
    parser.add_argument(
        "--clean-dir",
        default=str(Path(__file__).resolve().parents[2] / "cursor-internship-ingest" / "data" / "clean"),
        help="Path to cursor-internship-ingest/data/clean directory.",
    )
    args = parser.parse_args()
    clean_dir = Path(args.clean_dir)

    if not clean_dir.exists():
        raise FileNotFoundError(f"Directory {clean_dir} does not exist.")

    app = create_app()
    with app.app_context():
        import_listings(clean_dir)
        print(f"Imported listings from {clean_dir}")


if __name__ == "__main__":
    main()




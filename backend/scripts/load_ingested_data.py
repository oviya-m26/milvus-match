import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import pandas as pd

from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import Job, User
from backend.services.embedding_service import encode_text
from backend.services.milvus_client import MilvusClient
import uuid


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

        text = " ".join(
            filter(
                None,
                [
                    job.position,
                    job.company,
                    job.job_description,
                    " ".join(job.skills_required or []),
                ],
            )
        )
        vector = encode_text(text)
        if vector:
            job.embedding = vector
            job.vector_id = job.id
            try:
                client = MilvusClient()
                client.upsert(job.id, vector, {"jobId": job.id, "company": job.company})
            except Exception:
                pass

    db.session.commit()

def _encode_and_upsert(job: Job):
    text = " ".join(
        filter(
            None,
            [
                job.position,
                job.company,
                job.job_description,
                " ".join(job.skills_required or []),
            ],
        )
    )
    vector = encode_text(text)
    if vector:
        job.embedding = vector
        job.vector_id = job.id
        try:
            client = MilvusClient()
            client.upsert(job.id, vector, {"jobId": job.id, "company": job.company})
        except Exception:
            pass

def _safe_str(val) -> str:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    return str(val)

def import_kaggle_job_postings(clean_dir: Path, employer: User):
    candidates = [
        "job_postings.csv",
        "kaggle_job_postings.csv",
        "jobs_postings_clean.csv",
    ]
    for name in candidates:
        path = clean_dir / name
        if not path.exists():
            continue
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            title = _safe_str(row.get("title")) or "Job"
            company = _safe_str(row.get("company")) or "Unknown"
            skills = parse_skills(row.get("skills"))
            salary = _safe_str(row.get("salary"))
            experience = _safe_str(row.get("experience"))
            location = _safe_str(row.get("location")) or _safe_str(row.get("city")) or _safe_str(row.get("country"))
            job = Job(
                id=str(uuid.uuid4()),
                employer_id=employer.id,
                position=title,
                company=company,
                job_location=location or "India",
                job_type="internship",
                status="pending",
                job_description=_safe_str(row.get("job_description")) or _safe_str(row.get("description")),
                skills_required=skills,
                tags=[tag for tag in [experience, "kaggle"] if tag],
                salary=salary,
            )
            db.session.add(job)
            _encode_and_upsert(job)
        db.session.commit()
        print(f"Imported Kaggle job postings from {path}")
        break

def import_data_science_job_salaries(clean_dir: Path, employer: User):
    candidates = [
        "data_science_job_salaries.csv",
        "data_science_salaries.csv",
    ]
    for name in candidates:
        path = clean_dir / name
        if not path.exists():
            continue
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            title = _safe_str(row.get("job_title")) or "Data Role"
            company_loc = _safe_str(row.get("company_location")) or _safe_str(row.get("employee_residence"))
            remote_ratio = row.get("remote_ratio")
            salary_usd = row.get("salary_in_usd")
            salary = f"${int(salary_usd)} / year" if isinstance(salary_usd, (int, float)) and not pd.isna(salary_usd) else ""
            tags = []
            if isinstance(remote_ratio, (int, float)) and not pd.isna(remote_ratio):
                tags.append(f"remote_ratio:{int(remote_ratio)}")
            job = Job(
                id=str(uuid.uuid4()),
                employer_id=employer.id,
                position=title,
                company="Various",
                job_location=company_loc or "Global",
                job_type="internship",
                status="pending",
                job_description=_safe_str(row.get("job_category")) or "",
                skills_required=parse_skills(row.get("skills")),
                tags=tags + ["kaggle"],
                salary=salary,
            )
            db.session.add(job)
            _encode_and_upsert(job)
        db.session.commit()
        print(f"Imported Data Science job salaries from {path}")
        break

def import_linkedin_jobs(clean_dir: Path, employer: User):
    candidates = [
        "linkedin_jobs.csv",
        "linkedin_job_postings.csv",
    ]
    for name in candidates:
        path = clean_dir / name
        if not path.exists():
            continue
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            title = _safe_str(row.get("title")) or "Job"
            company = _safe_str(row.get("company")) or "Unknown"
            location = _safe_str(row.get("location"))
            description = _safe_str(row.get("description")) or _safe_str(row.get("job_description"))
            skills = parse_skills(row.get("skills"))
            job = Job(
                id=str(uuid.uuid4()),
                employer_id=employer.id,
                position=title,
                company=company,
                job_location=location or "India",
                job_type="internship",
                status="pending",
                job_description=description,
                skills_required=skills,
                tags=["linkedin"],
            )
            db.session.add(job)
            _encode_and_upsert(job)
        db.session.commit()
        print(f"Imported LinkedIn jobs from {path}")
        break

def import_levels_fyi(clean_dir: Path, employer: User):
    candidates = [
        "levels_fyi.csv",
        "levels_fyi_salaries.csv",
    ]
    for name in candidates:
        path = clean_dir / name
        if not path.exists():
            continue
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            role = _safe_str(row.get("role")) or _safe_str(row.get("title")) or "Tech Role"
            company = _safe_str(row.get("company")) or "Unknown"
            level = _safe_str(row.get("level"))
            location = _safe_str(row.get("location"))
            comp = _safe_str(row.get("compensation")) or _safe_str(row.get("totalcomp"))
            job = Job(
                id=str(uuid.uuid4()),
                employer_id=employer.id,
                position=role,
                company=company,
                job_location=location or "Global",
                job_type="internship",
                status="pending",
                job_description=f"Level: {level}" if level else "",
                skills_required=[],
                tags=[tag for tag in [level, "levels_fyi"] if tag],
                salary=comp,
            )
            db.session.add(job)
            _encode_and_upsert(job)
        db.session.commit()
        print(f"Imported Levels.fyi roles from {path}")
        break

def import_glassdoor(clean_dir: Path, employer: User):
    candidates = [
        "glassdoor_salaries.csv",
        "glassdoor_jobs.csv",
    ]
    for name in candidates:
        path = clean_dir / name
        if not path.exists():
            continue
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            title = _safe_str(row.get("title")) or "Job"
            company = _safe_str(row.get("company")) or "Unknown"
            rating = _safe_str(row.get("rating"))
            salary = _safe_str(row.get("salary")) or _safe_str(row.get("salary_range"))
            location = _safe_str(row.get("location"))
            job = Job(
                id=str(uuid.uuid4()),
                employer_id=employer.id,
                position=title,
                company=company,
                job_location=location or "India",
                job_type="internship",
                status="pending",
                job_description=f"Rating: {rating}" if rating else "",
                skills_required=parse_skills(row.get("skills")),
                tags=["glassdoor"],
                salary=salary,
            )
            db.session.add(job)
            _encode_and_upsert(job)
        db.session.commit()
        print(f"Imported Glassdoor dataset from {path}")
        break


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
        employer = ensure_system_employer()
        import_kaggle_job_postings(clean_dir, employer)
        import_data_science_job_salaries(clean_dir, employer)
        import_linkedin_jobs(clean_dir, employer)
        import_levels_fyi(clean_dir, employer)
        import_glassdoor(clean_dir, employer)
        print(f"Imported listings from {clean_dir}")


if __name__ == "__main__":
    main()




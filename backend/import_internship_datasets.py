import os
import sys
import json
import uuid
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from models.internship import Internship

# Configuration
DATASETS_DIR = Path("datasets")
DATASETS = {
    "internships-in-india": "meetnagadia/internships-in-india-dataset",
    "naukri-jobs": "PromptCloudHQ/jobs-on-naukricom",
    "naukri-job-postings": "IMDB2022/naukri-job-postings",
    "internshala": "shubham2502/internshala-internship-dataset",
    "linkedin-jobs": "PromptCloudHQ/linkedin-job-listings"
}

def setup_directories():
    """Create necessary directories for datasets."""
    DATASETS_DIR.mkdir(exist_ok=True)

def download_datasets():
    """Download datasets from Kaggle."""
    try:
        import kaggle
    except ImportError:
        print("Kaggle API not found. Please install it with: pip install kaggle")
        return False
    
    for name, dataset in DATASETS.items():
        dataset_dir = DATASETS_DIR / name
        if not dataset_dir.exists():
            print(f"Downloading {name} dataset...")
            try:
                os.system(f"kaggle datasets download -d {dataset} -p {dataset_dir}")
                # Extract the downloaded file
                for file in dataset_dir.glob("*.zip"):
                    import zipfile
                    with zipfile.ZipFile(file, 'r') as zip_ref:
                        zip_ref.extractall(dataset_dir)
            except Exception as e:
                print(f"Error downloading {name}: {str(e)}")
    return True

def process_internships_india():
    """Process Internships in India dataset."""
    dataset_path = DATASETS_DIR / "internships-in-india"
    csv_files = list(dataset_path.glob("*.csv"))
    
    if not csv_files:
        print("No CSV files found in the dataset directory")
        return []
    
    df = pd.read_csv(csv_files[0])
    internships = []
    
    for _, row in df.iterrows():
        try:
            internship = {
                "id": str(uuid.uuid4()),
                "title": row.get("title", ""),
                "company": row.get("company", ""),
                "description": row.get("description", ""),
                "location": row.get("location", ""),
                "stipend": str(row.get("stipend", "")),
                "duration": row.get("duration", ""),
                "category": row.get("category", "General"),
                "posted_date": datetime.utcnow(),
                "application_deadline": datetime.utcnow() + timedelta(days=30),
                "requirements": json.dumps([s.strip() for s in str(row.get("requirements", "")).split(",") if s.strip()]),
                "skills": json.dumps([s.strip() for s in str(row.get("skills", "")).split(",") if s.strip()])
            }
            internships.append(internship)
        except Exception as e:
            print(f"Error processing internship: {str(e)}")
    
    return internships

def process_naukri_jobs():
    """Process Naukri.com job listings."""
    dataset_path = DATASETS_DIR / "naukri-jobs"
    csv_files = list(dataset_path.glob("*.csv"))
    
    if not csv_files:
        print("No CSV files found in the Naukri dataset directory")
        return []
    
    df = pd.read_csv(csv_files[0])
    internships = []
    
    for _, row in df.iterrows():
        try:
            internship = {
                "id": str(uuid.uuid4()),
                "title": row.get("jobtitle", ""),
                "company": row.get("company", ""),
                "description": row.get("jobdescription", ""),
                "location": row.get("joblocation_address", ""),
                "stipend": str(row.get("salary", "")),
                "duration": "6 months",  # Default duration
                "category": row.get("jobtitle", "General"),
                "posted_date": datetime.utcnow(),
                "application_deadline": datetime.utcnow() + timedelta(days=30),
                "requirements": json.dumps([s.strip() for s in str(row.get("jobdescription", "")).split("\n") if s.strip()]),
                "skills": json.dumps([s.strip() for s in str(row.get("skills", "")).split(",") if s.strip()])
            }
            internships.append(internship)
        except Exception as e:
            print(f"Error processing Naukri job: {str(e)}")
    
    return internships

def save_to_database(internships):
    """Save processed internships to the database."""
    if not internships:
        print("No internships to save")
        return
    
    app = create_app()
    with app.app_context():
        try:
            # Add all internships to the session
            for data in internships:
                internship = Internship(**data)
                db.session.add(internship)
            
            # Commit the session to save all internships at once
            db.session.commit()
            print(f"Successfully added {len(internships)} internships to the database")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error saving to database: {str(e)}")

def main():
    print("Setting up directories...")
    setup_directories()
    
    print("Downloading datasets (if not already downloaded)...")
    if not download_datasets():
        print("Failed to download datasets. Please check your Kaggle API setup.")
        return
    
    all_internships = []
    
    print("Processing Internships in India dataset...")
    all_internships.extend(process_internships_india())
    
    print("Processing Naukri Jobs dataset...")
    all_internships.extend(process_naukri_jobs())
    
    print(f"Total internships to import: {len(all_internships)}")
    
    if all_internships:
        print("Saving to database...")
        save_to_database(all_internships)
    else:
        print("No internships to import.")

if __name__ == "__main__":
    main()

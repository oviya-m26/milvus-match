import logging
from typing import List, Dict, Optional
from datetime import datetime
import pandas as pd
from backend.models import Internship, db
from backend.services.embedding_service import encode_text

class InternshipService:
    """Service for handling internship data processing and management."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def process_internship_data(self, internship_data: Dict) -> Internship:
        """Process and store internship data from external sources.
        
        Args:
            internship_data: Dictionary containing internship details
            
        Returns:
            Internship: Created or updated internship object
        """
        try:
            # Check if internship already exists
            internship = Internship.query.filter_by(
                external_id=internship_data.get('external_id'),
                source=internship_data.get('source')
            ).first()

            # Prepare data for embedding
            description = internship_data.get('description', '')
            requirements = ' '.join(internship_data.get('requirements', []))
            skills = ' '.join(internship_data.get('skills', []))
            
            # Combine text for embedding
            text_to_embed = f"{internship_data.get('title', '')} {description} {requirements} {skills}"
            
            if internship:
                # Update existing internship
                for key, value in internship_data.items():
                    if hasattr(internship, key):
                        setattr(internship, key, value)
                internship.embedding = encode_text(text_to_embed)
                internship.updated_at = datetime.utcnow()
                self.logger.info(f"Updated internship: {internship.id}")
            else:
                # Create new internship
                internship = Internship(
                    **internship_data,
                    embedding=encode_text(text_to_embed),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(internship)
                self.logger.info(f"Created new internship: {internship.id}")

            db.session.commit()
            return internship

        except Exception as e:
            self.logger.error(f"Error processing internship data: {str(e)}")
            db.session.rollback()
            raise

    def fetch_government_internships(self) -> List[Dict]:
        """Fetch internships from government data sources.
        
        Returns:
            List[Dict]: List of processed internship data
        """
        # TODO: Implement actual API integration with government portals
        # This is a placeholder implementation
        return []

    def fetch_private_internships(self) -> List[Dict]:
        """Fetch internships from private job portals.
        
        Returns:
            List[Dict]: List of processed internship data
        """
        # TODO: Implement actual API integration with private job portals
        # This is a placeholder implementation
        return []

    def process_csv_upload(self, file_path: str, source: str = "upload") -> int:
        """Process internship data from a CSV file.
        
        Args:
            file_path: Path to the CSV file
            source: Source identifier for the upload
            
        Returns:
            int: Number of internships processed
        """
        try:
            df = pd.read_csv(file_path)
            processed_count = 0
            
            for _, row in df.iterrows():
                internship_data = {
                    'title': row.get('title', ''),
                    'company': row.get('company', ''),
                    'description': row.get('description', ''),
                    'location': row.get('location', ''),
                    'start_date': row.get('start_date'),
                    'duration': row.get('duration'),
                    'stipend': row.get('stipend'),
                    'requirements': row.get('requirements', '').split('|') if 'requirements' in row else [],
                    'skills': row.get('skills', '').lower().split(','),
                    'category': row.get('category', 'general'),
                    'source': source,
                    'external_id': row.get('id'),
                    'is_government': row.get('is_government', False),
                    'quota_details': {
                        'sc': row.get('sc_quota', 0),
                        'st': row.get('st_quota', 0),
                        'obc': row.get('obc_quota', 0),
                        'ews': row.get('ews_quota', 0),
                        'women': row.get('women_quota', 0)
                    } if any(col in row for col in ['sc_quota', 'st_quota', 'obc_quota', 'ews_quota', 'women_quota']) else {}
                }
                
                self.process_internship_data(internship_data)
                processed_count += 1
                
            db.session.commit()
            return processed_count
            
        except Exception as e:
            self.logger.error(f"Error processing CSV file: {str(e)}")
            db.session.rollback()
            raise

    def get_internship_recommendations(self, user_id: str, top_n: int = 10) -> List[Dict]:
        """Get personalized internship recommendations for a user.
        
        Args:
            user_id: ID of the user
            top_n: Number of recommendations to return
            
        Returns:
            List[Dict]: List of recommended internships with scores
        """
        # TODO: Implement recommendation logic using vector similarity
        # This is a placeholder implementation
        return []

# Singleton instance
internship_service = InternshipService()

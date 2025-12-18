from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid

from extensions import db
from models import Internship, User
from services.internship_service import internship_service
from utils.decorators import admin_required

bp = Blueprint('internship', __name__, url_prefix='/api/internships')

@bp.route('', methods=['GET'])
@jwt_required()
def get_internships():
    """Get paginated list of internships with optional filters."""
    try:
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Filters
        category = request.args.get('category')
        is_government = request.args.get('is_government', type=lambda x: x.lower() == 'true')
        search = request.args.get('search')
        
        query = Internship.query
        
        if category:
            query = query.filter(Internship.category == category)
        if is_government is not None:
            query = query.filter(Internship.is_government == is_government)
        if search:
            search = f"%{search}%"
            query = query.filter(
                (Internship.title.ilike(search)) |
                (Internship.company.ilike(search)) |
                (Internship.description.ilike(search))
            )
        
        pagination = query.order_by(Internship.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False)
        
        internships = [internship.to_dict() for internship in pagination.items]
        
        return jsonify({
            'internships': internships,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching internships: {str(e)}")
        return jsonify({"error": "Failed to fetch internships"}), 500

@bp.route('/<internship_id>', methods=['GET'])
@jwt_required()
def get_internship(internship_id):
    """Get details of a specific internship."""
    try:
        internship = Internship.query.get_or_404(internship_id)
        return jsonify(internship.to_dict()), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching internship {internship_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch internship"}), 500

@bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized internship recommendations for the current user."""
    try:
        user_id = get_jwt_identity()
        top_n = request.args.get('top_n', 10, type=int)
        
        recommendations = internship_service.get_internship_recommendations(
            user_id=user_id,
            top_n=top_n
        )
        
        return jsonify({
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({"error": "Failed to generate recommendations"}), 500

@bp.route('/upload', methods=['POST'])
@jwt_required()
@admin_required
def upload_internships():
    """Upload internships from a CSV file."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "Only CSV files are allowed"}), 400
            
        # Save the file temporarily
        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'internships')
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        # Process the file
        source = request.form.get('source', 'upload')
        count = internship_service.process_csv_upload(filepath, source)
        
        # Clean up
        try:
            os.remove(filepath)
        except Exception as e:
            current_app.logger.warning(f"Failed to delete temporary file {filepath}: {str(e)}")
        
        return jsonify({
            "message": f"Successfully processed {count} internships",
            "count": count
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error uploading internships: {str(e)}")
        return jsonify({"error": "Failed to process internship data"}), 500

@bp.route('/sync/government', methods=['POST'])
@jwt_required()
@admin_required
def sync_government_internships():
    """Sync internships from government sources."""
    try:
        internships = internship_service.fetch_government_internships()
        count = 0
        
        for data in internships:
            try:
                internship_service.process_internship_data(data)
                count += 1
            except Exception as e:
                current_app.logger.error(f"Error processing government internship: {str(e)}")
        
        return jsonify({
            "message": f"Successfully synced {count} government internships",
            "count": count
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error syncing government internships: {str(e)}")
        return jsonify({"error": "Failed to sync government internships"}), 500

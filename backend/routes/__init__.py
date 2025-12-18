from flask import Blueprint

# Create a Blueprint for the main routes
main_bp = Blueprint('main', __name__)

# Import routes after creating the blueprint to avoid circular imports
# from . import internship_routes  # noqa: F401  # Commented out - uses flask_jwt_extended which is not installed

from flask import Blueprint, request
from pydantic import ValidationError

from backend.extensions import db
from backend.models import Application, Job
from backend.schemas.application import ApplicationCreate
from backend.services.matching_service import MatchingService
from backend.utils.decorators import token_required
from backend.utils.responses import error_response, success_response


applications_bp = Blueprint("applications", __name__)


@applications_bp.post("")
@token_required("applicant")
def create_application():
    # Get raw request data first
    request_data = request.get_json() or {}
    
    # Validate with Pydantic
    try:
        payload = ApplicationCreate(**request_data)
    except ValidationError as err:
        return error_response(err.errors(), 422)
    except Exception as e:
        return error_response(f"Invalid request data: {str(e)}", 400)

    try:
        # Get jobId from request data (Pydantic 1.10.13 has issues with required fields)
        job_id = request_data.get("jobId")
        justification = request_data.get("justification", "")
        
        if not job_id:
            return error_response("Job ID is required", 400)
        
        job = Job.query.get(job_id)
        if not job:
            return error_response("Job not found", 404)
        
        existing = Application.query.filter_by(
            user_id=request.user.id, job_id=job.id
        ).first()
        if existing:
            return error_response("Application already exists", 400)

        matcher = MatchingService()
        match_result = matcher.score_single(request.user, job)

        application = Application(
            user_id=request.user.id,
            job_id=job.id,
            justification=justification,
            match_score=match_result.score,
            match_metadata={"reasons": match_result.reasons},
        )
        db.session.add(application)
        db.session.commit()
        response = application.to_dict()
        response["job"] = job.to_dict()
        return success_response({"application": response}, 201)
    except Exception as e:
        db.session.rollback()
        from flask import current_app
        current_app.logger.error(f"Application creation error: {str(e)}", exc_info=True)
        return error_response(f"Application failed: {str(e)}", 500)


@applications_bp.get("/me")
@token_required()
def my_applications():
    query = Application.query
    if request.user.role == "applicant":
        query = query.filter_by(user_id=request.user.id)
    else:
        query = query.join(Job).filter(Job.employer_id == request.user.id)

    applications = [
        {**application.to_dict(), "job": application.job.to_dict()}
        for application in query.order_by(Application.created_at.desc()).all()
    ]
    return success_response({"applications": applications})


@applications_bp.patch("/<application_id>/status")
@token_required("employer")
def update_application_status(application_id: str):
    status = request.json.get("status")
    if status not in {"pending", "interview", "declined", "matched", "selected"}:
        return error_response("Invalid status", 400)
    application = (
        Application.query.join(Job)
        .filter(
            Application.id == application_id, Job.employer_id == request.user.id
        )
        .first()
    )
    if not application:
        return error_response("Application not found", 404)
    application.status = status
    db.session.commit()
    return success_response({"application": application.to_dict()})



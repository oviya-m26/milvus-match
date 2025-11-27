from flask import Blueprint, request

from backend.services.audit_service import AuditService
from backend.services.matching_service import MatchingService
from backend.utils.decorators import token_required
from backend.utils.responses import success_response


matching_bp = Blueprint("matching", __name__)


@matching_bp.get("/recommendations")
@token_required("applicant")
def recommendations():
    limit = int(request.args.get("limit", 10))
    matcher = MatchingService()
    results = matcher.find_matches(request.user, limit)
    AuditService().log_matches(request.user.id, results)
    payload = [
        {
            "job": result.job.to_dict(),
            "score": result.score,
            "reasons": result.reasons,
            "diagnostics": result.diagnostics,
        }
        for result in results
    ]
    return success_response({"recommendations": payload})


@matching_bp.get("/audit/summary")
@token_required("admin")
def audit_summary():
    summary = AuditService().summary()
    return success_response({"summary": summary})


@matching_bp.get("/audit/logs")
@token_required("admin")
def audit_logs():
    job_id = request.args.get("jobId")
    category = request.args.get("category")
    limit = min(int(request.args.get("limit", 100)), 500)
    logs = AuditService().logs(job_id=job_id, social_category=category, limit=limit)
    return success_response({"logs": logs})



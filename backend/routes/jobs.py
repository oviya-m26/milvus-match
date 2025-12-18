from pathlib import Path

from flask import Blueprint, current_app, request
from pydantic import ValidationError
from sqlalchemy import func, or_

from backend.extensions import db
from backend.models import Job
from backend.schemas.job import JobBase
from backend.services.embedding_service import encode_text
from backend.services.milvus_client import MilvusClient
from backend.utils.decorators import token_required
from backend.utils.pagination import paginate
from backend.utils.responses import error_response, success_response


jobs_bp = Blueprint("jobs", __name__)


def _apply_filters(query, args):
    status = args.get("status", "all")
    job_type = args.get("jobType", "all")
    search = args.get("search")
    location = args.get("location", "all")

    if status != "all":
        query = query.filter_by(status=status)
    if job_type != "all":
        query = query.filter_by(job_type=job_type)
    if location != "all" and location:
        # Filter by location (city or state)
        location_like = f"%{location.lower()}%"
        query = query.filter(
            func.lower(Job.job_location).like(location_like)
        )
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Job.position).like(like),
                func.lower(Job.company).like(like),
            )
        )
    return query


def _apply_sort(query, sort):
    mapping = {
        "latest": Job.created_at.desc(),
        "oldest": Job.created_at.asc(),
        "a-z": Job.position.asc(),
        "z-a": Job.position.desc(),
    }
    return query.order_by(mapping.get(sort, Job.created_at.desc()))


def _encode_job(job: Job):
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
    if not vector:
        return

    job.embedding = vector
    job.vector_id = job.id
    try:
        client = MilvusClient()
        client.upsert(job.id, vector, {"jobId": job.id, "company": job.company})
    except Exception:  # noqa: BLE001
        # Milvus is optional. Continue silently in local dev.
        pass


@jobs_bp.post("")
@token_required("employer")
def create_job():
    try:
        payload = JobBase(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)
    user = request.user
    job = Job(
        employer_id=user.id,
        position=payload.position,
        company=payload.company,
        job_location=payload.jobLocation,
        job_type=payload.jobType,
        status=payload.status,
        job_description=payload.jobDescription,
        image=payload.image,
        skills_required=payload.skillsRequired,
        reservation_quota=payload.reservationQuota,
        capacity=payload.capacity,
        state_priority=payload.statePriority,
        tags=payload.tags,
        salary=payload.salary,
        application_deadline=payload.applicationDeadline,
    )
    _encode_job(job)
    db.session.add(job)
    db.session.commit()
    return success_response({"job": job.to_dict()}, 201)


@jobs_bp.get("")
@token_required()
def list_jobs():
    page = int(request.args.get("page", 1))
    sort = request.args.get("sort", "latest")
    per_page = current_app.config["PAGE_SIZE"]

    query = Job.query

    query = _apply_filters(query, request.args)
    query = _apply_sort(query, sort)
    jobs, total, num_pages = paginate(query, page, per_page)
    return success_response(
        {"jobs": [job.to_dict() for job in jobs], "totalJobs": total, "numOfPages": num_pages}
    )


@jobs_bp.get("/stats")
@token_required()
def stats():
    base_query = Job.query

    statuses = ["pending", "interview", "declined"]
    default_stats = {}
    for status in statuses:
        default_stats[status] = base_query.filter_by(status=status).count()

    monthly_totals = {}
    for job in base_query.order_by(Job.created_at.desc()).limit(120).all():
        key = job.created_at.strftime("%Y-%m")
        monthly_totals[key] = monthly_totals.get(key, 0) + 1
    monthly_applications = [
        {"date": date, "count": monthly_totals[date]}
        for date in sorted(monthly_totals.keys())[-6:]
    ]

    return success_response(
        {"defaultStats": default_stats, "monthlyApplications": monthly_applications}
    )


@jobs_bp.patch("/<job_id>")
@token_required("employer")
def update_job(job_id: str):
    job = Job.query.filter_by(id=job_id, employer_id=request.user.id).first()
    if not job:
        return error_response("Job not found", 404)
    try:
        payload = JobBase(**request.get_json())
    except ValidationError as err:
        return error_response(err.errors(), 422)

    job.position = payload.position
    job.company = payload.company
    job.job_location = payload.jobLocation
    job.job_type = payload.jobType
    job.status = payload.status
    job.job_description = payload.jobDescription
    job.image = payload.image
    job.skills_required = payload.skillsRequired
    job.reservation_quota = payload.reservationQuota
    job.capacity = payload.capacity
    job.state_priority = payload.statePriority
    job.tags = payload.tags
    job.salary = payload.salary
    job.application_deadline = payload.applicationDeadline
    _encode_job(job)
    db.session.commit()
    return success_response({"job": job.to_dict()})


@jobs_bp.delete("/<job_id>")
@token_required("employer")
def delete_job(job_id: str):
    job = Job.query.filter_by(id=job_id, employer_id=request.user.id).first()
    if not job:
        return error_response("Job not found", 404)
    db.session.delete(job)
    db.session.commit()
    return success_response({"msg": "Job deleted"})


@jobs_bp.post("/uploadImage")
@token_required("employer")
def upload_job_image():
    file = request.files.get("image")
    if not file:
        return error_response("Image file is required", 400)
    uploads_dir = Path(current_app.root_path).parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    filename = f"job_{file.filename}"
    file_path = uploads_dir / filename
    file.save(file_path)
    return success_response({"image": {"src": f"/uploads/{filename}"}})



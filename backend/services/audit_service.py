from __future__ import annotations

from typing import Iterable, List, Optional

from sqlalchemy import func

from backend.extensions import db
from backend.models import AllocationAudit, Job
from backend.services.quota_service import quota_service


class AuditService:
    def log_matches(self, user_id: str, matches: Iterable["MatchResult"]) -> None:
        events: List[AllocationAudit] = []
        for result in matches:
            diagnostics = result.diagnostics or {}
            audit = AllocationAudit(
                user_id=user_id,
                job_id=result.job.id,
                score=result.score,
                reasons=result.reasons,
                social_category=result.candidate_category,
                region=result.candidate_region,
                quota_snapshot=diagnostics.get("quotaSnapshot"),
                vector_score=diagnostics.get("vectorScore"),
            )
            events.append(audit)
        if events:
            db.session.bulk_save_objects(events)
            db.session.commit()

    def summary(self) -> dict:
        total = AllocationAudit.query.count()
        if total == 0:
            return {
                "totalRecommendations": 0,
                "averageScore": 0,
                "categoryBreakdown": [],
                "regionBreakdown": [],
                "quotaCompliance": [],
            }

        category_rows = (
            db.session.query(
                AllocationAudit.social_category,
                func.count(AllocationAudit.id),
            )
            .group_by(AllocationAudit.social_category)
            .all()
        )
        region_rows = (
            db.session.query(
                AllocationAudit.region,
                func.count(AllocationAudit.id),
            )
            .group_by(AllocationAudit.region)
            .all()
        )

        category_breakdown = [
            {
                "category": (category or "general").upper(),
                "count": count,
                "share": round(count / total, 3),
            }
            for category, count in category_rows
        ]

        region_breakdown = [
            {
                "region": region or "Unknown",
                "count": count,
                "share": round(count / total, 3),
            }
            for region, count in region_rows
        ]

        target_map = quota_service.default_reservation()
        quota_compliance = [
            {
                "category": key.upper(),
                "targetShare": round(value, 3),
                "actualShare": next(
                    (item["share"] for item in category_breakdown if item["category"] == key.upper()),
                    0.0,
                ),
            }
            for key, value in target_map.items()
        ]

        avg_score = (
            db.session.query(func.avg(AllocationAudit.score)).scalar() or 0.0
        )

        return {
            "totalRecommendations": total,
            "averageScore": round(avg_score, 3),
            "categoryBreakdown": category_breakdown,
            "regionBreakdown": region_breakdown,
            "quotaCompliance": quota_compliance,
        }

    def logs(
        self,
        job_id: Optional[str] = None,
        social_category: Optional[str] = None,
        limit: int = 100,
    ) -> List[dict]:
        query = AllocationAudit.query.order_by(AllocationAudit.created_at.desc())
        if job_id:
            query = query.filter_by(job_id=job_id)
        if social_category:
            query = query.filter_by(social_category=social_category.lower())
        rows = query.limit(limit).all()
        job_lookup = {
            job.id: job.to_dict()
            for job in Job.query.filter(Job.id.in_({row.job_id for row in rows})).all()
        }
        return [
            {
                "id": row.id,
                "userId": row.user_id,
                "jobId": row.job_id,
                "job": job_lookup.get(row.job_id),
                "score": row.score,
                "reasons": row.reasons,
                "socialCategory": row.social_category,
                "region": row.region,
                "vectorScore": row.vector_score,
                "quotaSnapshot": row.quota_snapshot,
                "createdAt": row.created_at.isoformat(),
            }
            for row in rows
        ]









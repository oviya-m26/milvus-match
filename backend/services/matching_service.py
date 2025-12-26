from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional

from backend.extensions import db
from backend.models import Job, User
from backend.services.embedding_service import encode_text
from backend.services.milvus_client import MilvusClient
from backend.services.quota_service import quota_service

SOCIAL_PRIORITY = {
    "sc": 0.2,
    "st": 0.2,
    "obc": 0.15,
    "ews": 0.1,
    "women": 0.1,
}


@dataclass
class MatchResult:
    job: Job
    score: float
    reasons: List[str]
    candidate_category: Optional[str] = None
    candidate_region: Optional[str] = None
    diagnostics: Optional[Dict] = None


class MatchingService:
    def __init__(self):
        try:
            self.milvus = MilvusClient()
        except Exception:  # noqa: BLE001
            self.milvus = None
        self.quota_service = quota_service

    def _candidate_vector(self, user: User) -> List[float]:
        if user.embedding:
            return user.embedding
        resume = user.resume_text or " ".join(user.skills or [])
        user.embedding = encode_text(resume)
        db.session.commit()
        return user.embedding

    def _vector_matches(self, vector: List[float], top_k: int):
        if not vector or not self.milvus or not self.milvus.collection:
            return []
        return self.milvus.search(vector, top_k)

    def _score_job(
        self,
        candidate: User,
        job: Job,
        vector_score: float | None,
        quota_snapshot: Optional[Dict[str, Dict[str, int]]],
    ) -> MatchResult:
        score = vector_score or 0.0
        reasons = []
        if vector_score:
            reasons.append("semantic fit via SBERT")

        candidate_category = (candidate.social_category or "").lower()
        quota_bonus, quota_reason = self.quota_service.quota_bonus(
            candidate, job, quota_snapshot or {}
        )
        if quota_bonus:
            score += quota_bonus
            reasons.append(quota_reason)
        elif candidate_category and not quota_snapshot:
            bonus = SOCIAL_PRIORITY.get(candidate_category, 0.1)
            score += bonus
            reasons.append(f"quota alignment (+{bonus:.2f})")

        if candidate.location and candidate.location.lower() in (
            job.job_location or ""
        ).lower():
            score += 0.1
            reasons.append("preferred location match (+0.10)")

        region_bonus, region_reason = self.quota_service.region_bonus(candidate, job)
        if region_bonus:
            score += region_bonus
            reasons.append(region_reason)

        skill_overlap = len(
            set((candidate.skills or []))
            & set((job.skills_required or []))
        )
        if skill_overlap:
            delta = min(0.2, 0.05 * skill_overlap)
            score += delta
            reasons.append(f"{skill_overlap} skill overlap (+{delta:.2f})")

        diagnostics = {
            "vectorScore": vector_score,
            "quotaSnapshot": quota_snapshot,
            "regionBonus": region_bonus if region_bonus else 0.0,
        }
        return MatchResult(
            job=job,
            score=round(score, 3),
            reasons=reasons,
            candidate_category=candidate_category,
            candidate_region=candidate.region or candidate.state,
            diagnostics=diagnostics,
        )

    def find_matches(self, candidate: User, top_k: int = 10):
        vector = self._candidate_vector(candidate)
        matches = self._vector_matches(vector, top_k)
        jobs = []
        if matches:
            ids = [match[0] for match in matches]
            id_to_hit = {match[0]: match for match in matches}
            for job in Job.query.filter(Job.id.in_(ids)).all():
                hit = id_to_hit.get(job.id)
                quota_snapshot = self.quota_service.reservation_snapshot(job)
                jobs.append(
                    self._score_job(
                        candidate, job, hit[1] if hit else None, quota_snapshot
                    )
                )
        else:
            q = Job.query
            if candidate.location:
                q = q.filter(Job.job_location.ilike(f"%{candidate.location}%"))
            pool_size = max(top_k * 10, 50)
            pool = q.order_by(Job.created_at.desc()).limit(pool_size).all()
            if not pool:
                pool = (
                    Job.query.order_by(Job.created_at.desc())
                    .limit(pool_size)
                    .all()
                )
            for job in pool:
                quota_snapshot = self.quota_service.reservation_snapshot(job)
                jobs.append(self._score_job(candidate, job, None, quota_snapshot))

        jobs.sort(key=lambda item: item.score, reverse=True)
        return jobs[:top_k]

    def score_single(self, candidate: User, job: Job) -> MatchResult:
        vector = self._candidate_vector(candidate)
        vector_score = None
        if vector and job.embedding:
            # cosine similarity approximation
            dot = sum(a * b for a, b in zip(vector, job.embedding))
            norm_candidate = sum(a * a for a in vector) ** 0.5
            norm_job = sum(a * a for a in job.embedding) ** 0.5
            if norm_candidate and norm_job:
                vector_score = dot / (norm_candidate * norm_job)
        quota_snapshot = self.quota_service.reservation_snapshot(job)
        return self._score_job(candidate, job, vector_score, quota_snapshot)


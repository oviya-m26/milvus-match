from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path
from typing import Dict, Tuple

from sqlalchemy import func

from backend.extensions import db
from backend.models import Application, Job, User

AUDIT_STATUSES = {"matched", "selected"}


class QuotaService:
    """Loads NSS-based reservation targets and helps compute quota compliance."""

    def __init__(self):
        self._config = self._load_config()

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_config() -> dict:
        data_path = Path(__file__).resolve().parents[1] / "data" / "reservation_targets.json"
        with data_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _state_config(self, state: str | None) -> dict:
        if not state:
            return {}
        return self._config.get("states", {}).get(state, {})

    def default_reservation(self) -> Dict[str, float]:
        return self._config.get("defaultReservation", {})

    def default_region_bonus(self) -> Dict[str, float]:
        return self._config.get("defaultRegionBonus", {})

    def reservation_targets(self, job: Job) -> Dict[str, int]:
        quota_source = job.reservation_quota or {}
        state_config = self._state_config(job.state_priority)
        reservation = state_config.get("reservation", quota_source) or quota_source

        if not reservation:
            reservation = self.default_reservation()

        capacity = max(job.capacity or 1, 1)
        normalized: Dict[str, int] = {}
        for raw_key, raw_value in reservation.items():
            if raw_value is None:
                continue
            key = str(raw_key).lower()
            ratio: float
            if isinstance(raw_value, str) and raw_value.endswith("%"):
                ratio = float(raw_value.rstrip("%")) / 100.0
            elif isinstance(raw_value, (int, float)):
                ratio = raw_value if raw_value <= 1 else raw_value / capacity
            else:
                continue
            count = max(1, math.ceil(capacity * ratio))
            normalized[key] = count

        if not normalized:
            normalized = {
                key: max(1, math.ceil(capacity * value))
                for key, value in self.default_reservation().items()
            }
        return normalized

    def current_allocations(self, job_id: str) -> Dict[str, int]:
        rows = (
            db.session.query(User.social_category, func.count(Application.id))
            .join(User, User.id == Application.user_id)
            .filter(
                Application.job_id == job_id,
                Application.status.in_(AUDIT_STATUSES),
            )
            .group_by(User.social_category)
            .all()
        )
        return {str(category or "general").lower(): count for category, count in rows}

    def reservation_snapshot(self, job: Job) -> Dict[str, Dict[str, int]]:
        targets = self.reservation_targets(job)
        allocations = self.current_allocations(job.id)
        remaining = {
            key: max(0, targets.get(key, 0) - allocations.get(key, 0))
            for key in targets.keys()
        }
        return {
            "targets": targets,
            "allocated": allocations,
            "remaining": remaining,
        }

    def quota_bonus(
        self,
        candidate: User,
        job: Job,
        snapshot: Dict[str, Dict[str, int]],
    ) -> Tuple[float, str | None]:
        category = (candidate.social_category or "").lower()
        if not category or not snapshot:
            return 0.0, None
        remaining = snapshot.get("remaining", {})
        if remaining.get(category, 0) > 0:
            bonus = 0.25
            return bonus, f"{category.upper()} slot available (+{bonus:.2f})"
        if snapshot.get("targets"):
            # mild penalty to discourage over-allocation beyond quota
            return -0.05, f"{category.upper()} quota saturated (-0.05)"
        return 0.0, None

    def region_bonus(self, candidate: User, job: Job) -> Tuple[float, str | None]:
        region = candidate.region or candidate.state or candidate.location
        if not region:
            return 0.0, None
        region = region.strip()
        state_config = self._state_config(job.state_priority)
        region_bonus_map = state_config.get("regionBonus") or self.default_region_bonus()
        bonus = region_bonus_map.get(region, 0.0)
        if bonus:
            return bonus, f"regional uplift for {region} (+{bonus:.2f})"
        return 0.0, None


quota_service = QuotaService()






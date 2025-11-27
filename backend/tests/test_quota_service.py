from dataclasses import dataclass

from backend.services.quota_service import QuotaService


@dataclass
class DummyJob:
    employer_id: str
    capacity: int = 1
    reservation_quota: dict | None = None
    state_priority: str | None = None


@dataclass
class DummyUser:
    social_category: str | None = None
    region: str | None = None
    state: str | None = None


def test_reservation_targets_defaults():
    service = QuotaService()
    job = DummyJob(employer_id="seed", capacity=4, reservation_quota={})
    targets = service.reservation_targets(job)
    assert sum(targets.values()) >= 4
    assert "sc" in targets and targets["sc"] >= 1


def test_quota_bonus_prefers_open_slots():
    service = QuotaService()
    candidate = DummyUser(social_category="SC")
    job = DummyJob(employer_id="seed", capacity=2)
    snapshot = {
        "targets": {"sc": 1},
        "allocated": {"sc": 0},
        "remaining": {"sc": 1},
    }
    bonus, reason = service.quota_bonus(candidate, job, snapshot)
    assert bonus > 0
    assert "SC" in reason


def test_region_bonus_uses_state_mapping():
    service = QuotaService()
    candidate = DummyUser(region=None, state="Tamil Nadu")
    job = DummyJob(employer_id="seed", state_priority="Tamil Nadu")
    bonus, reason = service.region_bonus(candidate, job)
    assert bonus >= 0
    if bonus:
        assert "Tamil Nadu" in reason


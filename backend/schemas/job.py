from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JobBase(BaseModel):
    position: str = Field(..., min_length=2, max_length=120)
    company: str = Field(..., min_length=2, max_length=120)
    jobLocation: str = Field(..., min_length=2, max_length=160)
    jobType: str = Field(default="full-time")
    status: str = Field(default="pending")
    jobDescription: Optional[str]
    image: Optional[str]
    skillsRequired: List[str] = Field(default_factory=list)
    reservationQuota: dict = Field(default_factory=dict)
    capacity: int = 1
    statePriority: Optional[str]
    tags: List[str] = Field(default_factory=list)
    salary: Optional[str]
    applicationDeadline: Optional[datetime]


class JobUpdate(JobBase):
    pass



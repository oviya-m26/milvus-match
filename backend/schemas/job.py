from datetime import datetime
from typing import List

from pydantic import BaseModel


class JobBase(BaseModel):
    position: str
    company: str
    jobLocation: str
    jobType: str = "full-time"
    status: str = "pending"
    jobDescription: str = ""
    image: str = ""
    skillsRequired: List[str] = []
    reservationQuota: dict = {}
    capacity: int = 1
    statePriority: str = ""
    tags: List[str] = []
    salary: str = ""
    applicationDeadline: str = ""

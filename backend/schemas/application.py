from typing import Optional

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    jobId: str = Field(..., min_length=1)
    justification: Optional[str]



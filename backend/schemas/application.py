from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    jobId: str
    justification: str = ""

from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="applicant", pattern="^(applicant|employer)$")
    location: Optional[str]
    state: Optional[str]
    region: Optional[str]
    socialCategory: Optional[str]
    skills: List[str] = Field(default_factory=list)
    preferences: dict = Field(default_factory=dict)
    resumeText: Optional[str]


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class UpdateUserSchema(BaseModel):
    name: Optional[str]
    location: Optional[str]
    state: Optional[str]
    region: Optional[str]
    socialCategory: Optional[str]
    skills: Optional[List[str]]
    preferences: Optional[dict]
    resumeText: Optional[str]
    avatar: Optional[str]



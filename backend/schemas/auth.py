from typing import List

from pydantic import BaseModel, EmailStr


class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "applicant"
    location: str = ""
    state: str = ""
    region: str = ""
    socialCategory: str = ""
    skills: List[str] = []
    preferences: dict = {}
    resumeText: str = ""


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class UpdateUserSchema(BaseModel):
    name: str = ""
    location: str = ""
    state: str = ""
    region: str = ""
    socialCategory: str = ""
    skills: List[str] = []
    preferences: dict = {}
    resumeText: str = ""
    avatar: str = ""

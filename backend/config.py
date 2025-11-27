import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()


class Config:
    """Base Flask configuration."""

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///applicant_aura.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me")
    JWT_EXP_DELTA = timedelta(
        minutes=int(os.getenv("JWT_EXP_MINUTES", 60 * 24))
    )
    MILVUS_URI = os.getenv("MILVUS_URI")
    MILVUS_TOKEN = os.getenv("MILVUS_TOKEN")
    MILVUS_COLLECTION = os.getenv("MILVUS_COLLECTION", "applicant_aura_jobs")
    EMBEDDING_MODEL = os.getenv(
        "EMBEDDING_MODEL", "sentence-transformers/all-mpnet-base-v2"
    )
    API_PREFIX = "/api/v1"
    MATCH_TOP_K = int(os.getenv("MATCH_TOP_K", 25))
    PAGE_SIZE = int(os.getenv("PAGE_SIZE", 9))


class TestConfig(Config):
    """Configuration overrides for tests."""

    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True


class DevConfig(Config):
    DEBUG = True



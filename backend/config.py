import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # App settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_EXP_DELTA = os.environ.get('JWT_EXP_DELTA')
    if JWT_EXP_DELTA:
        from datetime import timedelta
        JWT_EXP_DELTA = timedelta(seconds=int(JWT_EXP_DELTA))
    else:
        from datetime import timedelta
        JWT_EXP_DELTA = timedelta(days=7)
    
    # Zilliz Vector Database settings
    ZILLIZ_URI = os.environ.get('ZILLIZ_URI')
    ZILLIZ_TOKEN = os.environ.get('ZILLIZ_TOKEN')
    ZILLIZ_COLLECTION = os.environ.get('ZILLIZ_COLLECTION', 'internships')
    MILVUS_URI = os.environ.get('MILVUS_URI') or ZILLIZ_URI
    MILVUS_TOKEN = os.environ.get('MILVUS_TOKEN') or ZILLIZ_TOKEN
    MILVUS_COLLECTION = os.environ.get('MILVUS_COLLECTION') or ZILLIZ_COLLECTION
    
    # Embedding model settings
    EMBEDDING_MODEL = os.environ.get('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
    
    # Application settings
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    API_PREFIX = os.environ.get('API_PREFIX', '/api/v1')
    PAGE_SIZE = int(os.environ.get('PAGE_SIZE', 10))

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    # Ensure these are set in production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    ZILLIZ_URI = os.environ['ZILLIZ_URI']
    ZILLIZ_TOKEN = os.environ['ZILLIZ_TOKEN']

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

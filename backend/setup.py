from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "Flask==3.0.3",
        "Flask-SQLAlchemy==3.1.1",
        "Flask-Bcrypt==1.0.1",
        "Flask-Cors==4.0.0",
        "python-dotenv==1.0.1",
        "PyJWT==2.9.0",
        "pydantic==1.10.13",
        "sentence-transformers==3.0.1",
        "pymilvus==2.4.4",
        "pandas==2.3.3",
        "pytest==8.3.3",
    ],
)
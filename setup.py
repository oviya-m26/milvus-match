from setuptools import setup, find_packages

setup(
    name="applicant-aura",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # List your project's dependencies here
        'flask',
        'flask-sqlalchemy',
        'flask-cors',
        'flask-bcrypt',
        'flask-jwt-extended',
        'pymilvus',
        'sentence-transformers',
        'python-dotenv',
        'pydantic',
    ],
    python_requires='>=3.8',
)

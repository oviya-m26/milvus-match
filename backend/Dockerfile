FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend /app/backend

ENV FLASK_APP=backend.app \
    FLASK_ENV=production

EXPOSE 5000

CMD ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]


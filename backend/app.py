from pathlib import Path

from flask import Flask, jsonify, send_from_directory

from backend import models  # noqa: F401
from backend.config import Config
from backend.extensions import bcrypt, cors, db
from backend.routes.auth import auth_bp
from backend.routes.jobs import jobs_bp
from backend.routes.applications import applications_bp
from backend.routes.matching import matching_bp


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    bcrypt.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp, url_prefix=f"{app.config['API_PREFIX']}/auth")
    app.register_blueprint(jobs_bp, url_prefix=f"{app.config['API_PREFIX']}/jobs")
    app.register_blueprint(
        applications_bp, url_prefix=f"{app.config['API_PREFIX']}/applications"
    )
    app.register_blueprint(
        matching_bp, url_prefix=f"{app.config['API_PREFIX']}/matching"
    )

    uploads_dir = Path(app.root_path).parent / "uploads"

    @app.get("/uploads/<path:filename>")
    def serve_upload(filename: str):
        return send_from_directory(uploads_dir, filename)

    @app.get("/api/v1/health")
    def health() -> tuple[dict, int]:
        return jsonify({"status": "ok"}), 200

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host="0.0.0.0", port=5000)

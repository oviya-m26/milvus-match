import argparse
import sys
from getpass import getpass

from backend.app import create_app
from backend.extensions import bcrypt, db
from backend.models import User


def ensure_admin(email: str, password: str, name: str, state: str | None) -> User:
    """Create or update an admin user account."""
    user = User.query.filter_by(email=email.lower()).first()
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    if user:
        user.name = name or user.name
        user.state = state or user.state
        user.role = "admin"
        user.password_hash = password_hash
    else:
        user = User(
            name=name or "Administrator",
            email=email.lower(),
            role="admin",
            state=state,
            location=state,
        )
        user.password_hash = password_hash
        db.session.add(user)

    db.session.commit()
    return user


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed or update an administrator account for ApplicantAura."
    )
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--name", default="System Admin")
    parser.add_argument("--state", default="India")
    parser.add_argument(
        "--password",
        help="Optional password. When omitted, you will be prompted interactively.",
    )
    args = parser.parse_args()

    password = args.password or getpass("Administrator password: ")
    if not password or len(password) < 6:
        print("Password must be at least 6 characters.", file=sys.stderr)
        sys.exit(1)

    app = create_app()
    with app.app_context():
        user = ensure_admin(args.email, password, args.name, args.state)
        print(f"Admin user ready: {user.email} (id={user.id})")


if __name__ == "__main__":
    main()









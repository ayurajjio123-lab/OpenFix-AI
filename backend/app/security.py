from pwdlib import PasswordHash
from starlette.requests import Request
from .models import User

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    try:
        return password_hash.verify(password, hashed)
    except Exception:
        return False

def set_session(request: Request, user: User):
    request.session.clear()
    request.session["user_id"] = user.id

def public_user(user: User) -> dict:
    return {"id": user.id, "name": user.display_name, "email": user.primary_email, "avatar_url": user.avatar_url}

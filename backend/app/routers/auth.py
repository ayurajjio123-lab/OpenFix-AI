import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..config import settings
from ..database import get_db
from ..models import User, AuthAccount
from ..oauth import oauth
from ..schemas import RegisterRequest, LoginRequest
from ..security import hash_password, verify_password, set_session, public_user

router = APIRouter(prefix="/auth", tags=["authentication"])

def frontend_redirect(path="/dashboard"):
    return RedirectResponse(url=f"{settings.frontend_url}{path}", status_code=303)

def account_user(db: Session, provider: str, provider_user_id: str, email: str | None,
                 name: str, avatar_url: str | None, password_hash: str | None = None):
    account = db.scalar(select(AuthAccount).where(
        AuthAccount.provider == provider, AuthAccount.provider_user_id == provider_user_id))
    if account:
        user = account.user
        if email and not user.primary_email:
            user.primary_email = email
        if name:
            user.display_name = name[:120]
        if avatar_url:
            user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)
        return user
    # Never merge two accounts just because their email strings match.
    user = User(display_name=(name or "OpenFix Developer")[:120], primary_email=email, avatar_url=avatar_url)
    db.add(user)
    db.flush()
    db.add(AuthAccount(user_id=user.id, provider=provider, provider_user_id=provider_user_id,
                       email=email, password_hash=password_hash))
    db.commit()
    db.refresh(user)
    return user

@router.post("/register")
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    exists = db.scalar(select(AuthAccount).where(AuthAccount.provider == "email",
                                                  AuthAccount.provider_user_id == email))
    if exists:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = account_user(db, "email", email, email, payload.name, None, hash_password(payload.password))
    set_session(request, user)
    return {"user": public_user(user)}

@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    account = db.scalar(select(AuthAccount).where(AuthAccount.provider == "email",
                                                  AuthAccount.provider_user_id == email))
    if not account or not account.password_hash or not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    set_session(request, account.user)
    return {"user": public_user(account.user)}

@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    uid = request.session.get("user_id")
    if not uid:
        return {"user": None}
    user = db.get(User, uid)
    if not user:
        request.session.clear()
        return {"user": None}
    return {"user": public_user(user)}

@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}

@router.get("/google/login")
async def google_login(request: Request):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google login is not configured. Add credentials to backend/.env.")
    return await oauth.google.authorize_redirect(request, f"{settings.backend_url}/auth/google/callback", prompt="select_account")

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        info = token.get("userinfo") or await oauth.google.parse_id_token(request, token)
        if not info or not info.get("sub"):
            raise ValueError("Google identity missing")
        user = account_user(db, "google", str(info["sub"]), info.get("email"),
                            info.get("name") or info.get("email") or "Google Developer", info.get("picture"))
        set_session(request, user)
        return frontend_redirect()
    except Exception:
        return frontend_redirect("/login?error=google_login_failed")

@router.get("/github/login")
async def github_login(request: Request):
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=503, detail="GitHub login is not configured. Add credentials to backend/.env.")
    return await oauth.github.authorize_redirect(request, f"{settings.backend_url}/auth/github/callback")

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
        headers = {"Authorization": f"Bearer {token['access_token']}", "Accept": "application/vnd.github+json"}
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://api.github.com/user", headers=headers)
            resp.raise_for_status()
            info = resp.json()
            email = info.get("email")
            if not email:
                emails = await client.get("https://api.github.com/user/emails", headers=headers)
                if emails.is_success:
                    verified = [x for x in emails.json() if x.get("primary") and x.get("verified")]
                    email = verified[0]["email"] if verified else None
        user = account_user(db, "github", str(info["id"]), email,
                            info.get("name") or info.get("login") or "GitHub Developer", info.get("avatar_url"))
        set_session(request, user)
        return frontend_redirect()
    except Exception:
        return frontend_redirect("/login?error=github_login_failed")

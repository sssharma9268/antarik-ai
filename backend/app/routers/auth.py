from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import DB, CurrentUser
from app.models import AuditLog, Organization, Team, User
from app.schemas import LoginIn, RegisterIn, TokenOut, UserOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_out(u: User) -> UserOut:
    return UserOut(
        id=u.id, email=u.email, full_name=u.full_name, role=u.role, org_id=u.org_id, team_id=u.team_id
    )


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(body: RegisterIn, db: DB):
    """Creates an organization, its default team, and the owner account.
    SSO (SAML/OIDC) replaces this for enterprise deployments — see roadmap."""
    if await db.scalar(select(User).where(User.email == body.email.lower())):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    org = Organization(name=body.org_name)
    db.add(org)
    await db.flush()
    team = Team(org_id=org.id, name="Default")
    db.add(team)
    await db.flush()
    user = User(
        org_id=org.id,
        team_id=team.id,
        email=body.email.lower(),
        full_name=body.full_name,
        password_hash=hash_password(body.password),
        role="owner",
    )
    db.add(user)
    await db.flush()
    db.add(AuditLog(org_id=org.id, actor_user_id=user.id, action="org.created", target=org.name))
    await db.commit()
    return TokenOut(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn, db: DB):
    user = await db.scalar(select(User).where(User.email == body.email.lower()))
    if not user or not user.is_active or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return TokenOut(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser):
    return _user_out(user)

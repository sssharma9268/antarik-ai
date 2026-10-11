import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    org_name: str = Field(min_length=2, max_length=200)
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt's input limit


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    org_id: uuid.UUID
    team_id: uuid.UUID


class ApiKeyCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    prefix: str
    revoked: bool
    last_used_at: datetime | None
    created_at: datetime


class ApiKeyCreatedOut(ApiKeyOut):
    key: str  # full key, returned only once


class UsageByModel(BaseModel):
    model: str
    requests: int
    prompt_tokens: int
    completion_tokens: int


class UsageSummaryOut(BaseModel):
    period_start: datetime
    requests: int
    prompt_tokens: int
    completion_tokens: int
    avg_latency_ms: float | None
    by_model: list[UsageByModel]

from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class AnalysisRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    body: str = Field(default="", max_length=20000)
    labels: list[str] = []
    repository: str = Field(default="", max_length=300)

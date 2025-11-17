# backend/app/schemas_auth.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime

    class Config:
        # FIX: Changed 'orm_mode' to 'from_attributes'
        from_attributes = True

class ResultCreate(BaseModel):
    category: str
    score: float
    meta: Optional[str] = None

class ResultOut(BaseModel):
    id: int
    category: str
    score: float
    meta: Optional[str]
    created_at: datetime

    class Config:
        # FIX: Changed 'orm_mode' to 'from_attributes'
        from_attributes = True

class ResultsList(BaseModel):
    results: List[ResultOut]
    
class Message(BaseModel):
    role: str
    content: str

class ConversationBase(BaseModel):
    category: str
    messages: List[Message]

class ConversationCreate(ConversationBase):
    pass

class ConversationOut(ConversationBase):
    updated_at: datetime
    
    class Config:
        from_attributes = True
# backend/app/schemas.py

from pydantic import BaseModel
from typing import List, Dict

class TextPayload(BaseModel):
    """Defines the expected request body for text-based AI endpoints."""
    text: str

class ChatPayload(BaseModel):
    """Defines the expected request body for the chatbot."""
    messages: List[Dict[str, str]]
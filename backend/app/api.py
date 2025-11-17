# backend/app/api.py

import os
import logging
from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from .services import generate_ai_response, process_resume_file, generate_chat_response_stream
from .schemas import TextPayload, ChatPayload

logger = logging.getLogger(__name__)
router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_DIR = os.path.join(BASE_DIR, "prompts")


@router.post("/generate-todo")
async def handle_generate_todo(payload: TextPayload):
    logger.info("Received request for to-do generation.")
    try:
        prompt_path = os.path.join(PROMPTS_DIR, "todo_prompt.txt")
        if not os.path.exists(prompt_path): raise FileNotFoundError("todo_prompt.txt not found")
        response_data = generate_ai_response(prompt_path, payload.text)
        return response_data
    except Exception as e:
        logger.error(f"Error generating to-do list: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# FIX: Added the missing analyze-mental-health endpoint
@router.post("/analyze-mental-health")
async def handle_analyze_mental_health(payload: TextPayload):
    """Handles the mental health analysis request."""
    logger.info("Received request for mental health analysis.")
    try:
        prompt_path = os.path.join(PROMPTS_DIR, "mental_health_prompt.txt")
        response_data = generate_ai_response(prompt_path, payload.text)
        return response_data
    except Exception as e:
        logger.error(f"Error during mental health analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# FIX: Added the missing analyze-resume endpoint
@router.post("/analyze-resume")
async def handle_analyze_resume(file: UploadFile = File(...)):
    """Handles resume upload (PDF or DOCX) for analysis."""
    logger.info(f"Received request for resume analysis for file: {file.filename}")
    if not file.content_type in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF or DOCX file.")
    try:
        resume_text = await process_resume_file(file)
        if not resume_text or not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")
        
        prompt_path = os.path.join(PROMPTS_DIR, "resume_prompt.txt")
        response_data = generate_ai_response(prompt_path, resume_text)
        return response_data
    except Exception as e:
        logger.error(f"An error occurred during resume analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def handle_chat(payload: ChatPayload):
    """Handles streaming chat requests for the interview coach."""
    logger.info("Received request for streaming chat.")
    try:
        prompt_path = os.path.join(PROMPTS_DIR, "interview_prompt.txt")
        if not os.path.exists(prompt_path): raise FileNotFoundError("interview_prompt.txt not found")
        return StreamingResponse(
            generate_chat_response_stream(prompt_path, payload.messages),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
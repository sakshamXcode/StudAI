# backend/app/services.py
import os
import logging
from typing import IO, List, Dict,Generator
from fastapi import UploadFile
import docx
from PyPDF2 import PdfReader
import asyncio
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

_json_model = None
_chat_model = None

json_generation_config = { "temperature": 1, "top_p": 0.95, "top_k": 64, "max_output_tokens": 8192, "response_mime_type": "application/json",}
chat_generation_config = { "temperature": 0.9, "top_p": 1, "top_k": 32, "max_output_tokens": 8192, "response_mime_type": "text/plain",}

def ensure_models():
    """Lazily configure the Gemini API and initialize model instances."""
    global _json_model, _chat_model
    if _json_model and _chat_model: return

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not set.")
        raise RuntimeError("GEMINI_API_KEY environment variable not found.")
    
    genai.configure(api_key=api_key)
    # Switched to the standard 'gemini-pro' model
    _json_model = genai.GenerativeModel("gemini-2.5-flash", generation_config=json_generation_config)
    _chat_model = genai.GenerativeModel("gemini-2.5-flash", generation_config=chat_generation_config)
    logger.info("Gemini models initialized.")

def extract_text_from_pdf(file: IO[bytes]) -> str:
    """Extracts text from a PDF file stream."""
    try:
        pdf_reader = PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"Error reading PDF file: {e}", exc_info=True)
        raise

def extract_text_from_docx(file: IO[bytes]) -> str:
    """Extracts text from a DOCX file stream."""
    try:
        doc = docx.Document(file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Error reading DOCX file: {e}", exc_info=True)
        raise

async def process_resume_file(file: UploadFile) -> str:
    """Processes an uploaded resume file and extracts its text content."""
    content_type = file.content_type
    file_stream = file.file
    file_stream.seek(0) 
    logger.info(f"Processing file of type: {content_type}")

    if content_type == "application/pdf":
        return extract_text_from_pdf(file_stream)
    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return extract_text_from_docx(file_stream)
    else:
        raise ValueError("Unsupported file type")

def generate_ai_response(prompt_file_path: str, user_text: str) -> dict:
    """Generates a structured JSON response from the AI using the json_model."""
    logger.info(f"Generating AI response from prompt: {prompt_file_path}")
    try:
        ensure_models()
        with open(prompt_file_path, "r", encoding="utf-8") as f:
            prompt_template = f.read()
        
        prompt = prompt_template.format(user_text=user_text)

        # FIX: Use generate_content for single, non-chat requests. It's more direct.
        response = _json_model.generate_content(prompt)

        if hasattr(response, "text") and response.text:
            return json.loads(response.text)
        else:
            logger.error("Model response had no text field.")
            raise RuntimeError("No response text from model.")
            
    except Exception as e:
        logger.error(f"generate_ai_response failed: {e}", exc_info=True)
        raise

# backend/app/services.py
# ... (other functions are correct) ...

# The rest of your services.py file is correct. Only this function needs to be changed.

# FIX: Removed 'async' from the function definition
def generate_chat_response_stream(prompt_file_path: str, messages: List[Dict[str, str]]) -> Generator[str, None, None]:
    """Generates a streaming chat response using the model's native chat history support."""
    logger.info("Generating streaming chat response.")
    try:
        ensure_models()
        with open(prompt_file_path, "r", encoding="utf-8") as f:
            system_instruction = f.read()

        gemini_history = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
        
        current_message_content = gemini_history.pop()["parts"]
        chat_session = _chat_model.start_chat(history=gemini_history)
        final_prompt = f"{system_instruction}\n\n{current_message_content[0]}"
        response_stream = chat_session.send_message(final_prompt, stream=True)
        
        # Use a standard 'for' loop
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.error(f"An error occurred during chat stream generation: {e}", exc_info=True)
        yield "Sorry, an internal error occurred while processing the chat."
    """Generates a streaming chat response using the model's native chat history support."""
    logger.info("Generating streaming chat response.")
    try:
        ensure_models()
        with open(prompt_file_path, "r", encoding="utf-8") as f:
            system_instruction = f.read()

        gemini_history = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
        
        # The last message is the current prompt, so we pop it from the history
        # (This logic is correct)
        current_message_content = gemini_history.pop()["parts"]

        chat_session = _chat_model.start_chat(history=gemini_history)
        
        final_prompt = f"{system_instruction}\n\n{current_message_content[0]}"

        # This call returns a streaming iterator
        response_stream = chat_session.send_message(final_prompt, stream=True)
        
        # FIX: Use a standard 'for' loop to iterate over the streaming response.
        # The library handles the network calls under the hood.
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.error(f"An error occurred during chat stream generation: {e}", exc_info=True)
        yield "Sorry, an internal error occurred while processing the chat."
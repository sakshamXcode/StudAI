# backend/main.py
# This is the SINGLE and ONLY entry point for your application.

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# --- FIX: Moved init_db to a more direct import path ---
# This allows us to call it before the app is fully configured.
from app.db import init_db 

# Load environment variables FIRST, before anything else.
load_dotenv()

# --- FIX: Call init_db() here, at the top level ---
# This creates the database file and all the tables BEFORE the FastAPI app
# starts importing routers that depend on those tables. This solves the "no such table" error.
init_db()

# --- Now, we can safely import the rest of our application modules ---
from app.routers import users
from app.api import router as api_router

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# --- FastAPI App Initialization ---
app = FastAPI(
    title="AI Assistant Suite API",
    description="An API for AI-powered career and wellness tools."
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER CONFIGURATION ---
app.include_router(api_router, prefix="/api", tags=["AI Services"])
app.include_router(users.router, prefix="/api", tags=["Authentication"])
app.include_router(users.user_router, prefix="/api", tags=["Users"])


# --- Application Lifecycle Events ---
@app.on_event("startup")
async def startup_event():
    # Configure Google Gemini API
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("FATAL: GEMINI_API_KEY environment variable not found.")
        raise RuntimeError("GEMINI_API_KEY is not set. The application cannot start.")
    try:
        genai.configure(api_key=api_key)
        logger.info("Gemini API configured successfully.")
    except Exception as exc:
        logger.exception("Failed to configure Gemini API during startup.")
        raise
    
    # NOTE: The init_db() call has been moved out of the startup event.
    logger.info("Application startup complete.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown.")
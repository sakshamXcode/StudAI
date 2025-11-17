# backend/app/routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models
from ..auth import get_db, get_password_hash, verify_password, create_access_token, get_current_user
from ..schemas_auth import UserCreate, UserLogin, Token, UserOut, ResultCreate, ResultOut, ResultsList,ConversationCreate, ConversationOut
from sqlalchemy.orm.exc import NoResultFound

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Handles new user registration.
    Checks for existing username/email and hashes the password before saving.
    """
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    if payload.email and db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(payload.password)
    user = models.User(username=payload.username, email=payload.email, hashed_password=hashed_password)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/login", response_model=Token)
def login(form_payload: UserLogin, db: Session = Depends(get_db)):
    """
    Handles user login.
    Verifies username and password and returns a JWT access token.
    """
    user = db.query(models.User).filter(models.User.username == form_payload.username).first()
    
    if not user or not verify_password(form_payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


# Define a separate router for user-specific endpoints that require authentication.
user_router = APIRouter(prefix="/users", tags=["Users"])

@user_router.get("/me", response_model=UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    """
    Returns the details of the currently authenticated user.
    """
    return current_user

@user_router.get("/conversation/{category}", response_model=ConversationOut)
def get_conversation(
    category: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        conversation = db.query(models.Conversation).filter(
            models.Conversation.user_id == current_user.id,
            models.Conversation.category == category
        ).one()
        return conversation
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Conversation not found for this category.")


@user_router.post("/conversation", response_model=ConversationOut)
def save_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Try to find an existing conversation for this user and category
    conversation = db.query(models.Conversation).filter(
        models.Conversation.user_id == current_user.id,
        models.Conversation.category == payload.category
    ).first()

    if conversation:
        # If it exists, update it
        conversation.messages = [msg.dict() for msg in payload.messages]
    else:
        # If it doesn't exist, create a new one
        conversation = models.Conversation(
            user_id=current_user.id,
            category=payload.category,
            messages=[msg.dict() for msg in payload.messages]
        )
        db.add(conversation)
    
    db.commit()
    db.refresh(conversation)
    return conversation



@user_router.post("/results", response_model=ResultOut, status_code=status.HTTP_201_CREATED)
def create_result(
    payload: ResultCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Saves a new result (e.g., from a practice test) for the current user.
    """
    result = models.Result(
        user_id=current_user.id, 
        category=payload.category, 
        score=payload.score, 
        meta=payload.meta
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@user_router.get("/results", response_model=ResultsList)
def list_results(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Lists all historical results for the currently authenticated user.
    """
    results = db.query(models.Result)\
                .filter(models.Result.user_id == current_user.id)\
                .order_by(models.Result.created_at.asc())\
                .all()
    
    return {"results": results}
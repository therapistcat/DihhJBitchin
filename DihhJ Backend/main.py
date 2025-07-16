#!/usr/bin/env python3
"""
Ultra-simple DihhJ Backend that will definitely work on Render
No motor dependency, minimal requirements
"""
import os
import json
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="DihhJ Backend API",
    description="A simple FastAPI backend for DihhJ Bitchers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://dihhjbitchin-ido5.onrender.com",
        "*"  # Allow all origins for now
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Simple in-memory storage (for testing)
users_db = {}
teas_db = {}
votes_db = {}

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str
    year: int

class UserLogin(BaseModel):
    username: str
    password: str

class TeaCreate(BaseModel):
    title: str
    content: str
    tag: str = "general"

class TeaVote(BaseModel):
    tea_id: str
    vote_type: str  # "upvote" or "downvote"

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to DihhJ Backend API!",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "register": "/auth/register",
            "login": "/auth/login", 
            "tea": "/tea",
            "docs": "/docs"
        }
    }

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "message": "API is running",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

# User registration
@app.post("/auth/register", tags=["Authentication"])
async def register_user(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    users_db[user.username] = {
        "username": user.username,
        "password": user.password,  # In real app, hash this
        "year": user.year,
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {
        "message": "User registered successfully!",
        "user": {
            "username": user.username,
            "year": user.year
        }
    }

# User login
@app.post("/auth/login", tags=["Authentication"])
async def login_user(user: UserLogin):
    if user.username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    stored_user = users_db[user.username]
    if stored_user["password"] != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    return {
        "message": "Login successful!",
        "user": {
            "username": stored_user["username"],
            "year": stored_user["year"]
        }
    }

# Create tea post
@app.post("/tea/create", tags=["Tea"])
async def create_tea(tea: TeaCreate, username: str):
    tea_id = f"tea_{len(teas_db) + 1}"

    teas_db[tea_id] = {
        "id": tea_id,
        "title": tea.title,
        "content": tea.content,
        "tag": tea.tag,
        "author": username,
        "upvotes": 0,
        "downvotes": 0,
        "score": 0,
        "created_at": datetime.utcnow().isoformat()
    }

    return {
        "message": "Tea posted successfully!",
        "tea": teas_db[tea_id]
    }

# Get all teas (with list endpoint)
@app.get("/tea/list", tags=["Tea"])
async def get_teas(skip: int = 0, limit: int = 10, sort_by: str = "hot", order: str = "desc"):
    tea_list = list(teas_db.values())

    # Sort by creation time (newest first) or by score for "hot"
    if sort_by == "hot":
        tea_list.sort(key=lambda x: x.get("score", 0), reverse=(order == "desc"))
    else:
        tea_list.sort(key=lambda x: x["created_at"], reverse=(order == "desc"))

    # Apply pagination
    paginated_teas = tea_list[skip:skip + limit]

    return {
        "teas": paginated_teas,
        "total": len(tea_list)
    }

# Keep the old endpoint for backward compatibility
@app.get("/tea", tags=["Tea"])
async def get_teas_old():
    return await get_teas()

# Vote on tea
@app.post("/tea/{tea_id}/vote", tags=["Tea"])
async def vote_tea(tea_id: str, username: str, vote_data: dict):
    if tea_id not in teas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )

    vote_type = vote_data.get("vote_type")
    user_vote_key = f"{username}_{tea_id}"

    # Remove previous vote if exists
    if user_vote_key in votes_db:
        prev_vote = votes_db[user_vote_key]
        if prev_vote == "upvote":
            teas_db[tea_id]["upvotes"] -= 1
        elif prev_vote == "downvote":
            teas_db[tea_id]["downvotes"] -= 1

    # Add new vote
    if vote_type == "upvote":
        teas_db[tea_id]["upvotes"] += 1
        votes_db[user_vote_key] = "upvote"
    elif vote_type == "downvote":
        teas_db[tea_id]["downvotes"] += 1
        votes_db[user_vote_key] = "downvote"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vote type"
        )

    # Update score (upvotes - downvotes)
    teas_db[tea_id]["score"] = teas_db[tea_id]["upvotes"] - teas_db[tea_id]["downvotes"]

    return {
        "message": "Vote recorded!",
        "tea": teas_db[tea_id]
    }

# Get user's vote status for a tea
@app.get("/tea/{tea_id}/user-vote", tags=["Tea"])
async def get_user_vote_status(tea_id: str, username: str):
    if tea_id not in teas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )

    user_vote_key = f"{username}_{tea_id}"
    user_vote = votes_db.get(user_vote_key)

    return {
        "user_vote": user_vote
    }

# Get tea by ID
@app.get("/tea/{tea_id}", tags=["Tea"])
async def get_tea(tea_id: str):
    if tea_id not in teas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )

    return teas_db[tea_id]

# Get available tags
@app.get("/tea/tags", tags=["Tea"])
async def get_tags():
    return {
        "tags": ["general", "informative", "hari-bitch", "snitching-on-my-bestie"]
    }

# Get batch statistics
@app.get("/tea/batches", tags=["Tea"])
async def get_batches():
    return {
        "batches": [
            {"batch": "25", "count": len([t for t in teas_db.values() if t.get("batch") == "25"])},
            {"batch": "26", "count": len([t for t in teas_db.values() if t.get("batch") == "26"])},
            {"batch": "27", "count": len([t for t in teas_db.values() if t.get("batch") == "27"])}
        ]
    }

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

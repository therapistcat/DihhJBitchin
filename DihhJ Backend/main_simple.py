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
@app.post("/tea", tags=["Tea"])
async def create_tea(tea: TeaCreate):
    tea_id = f"tea_{len(teas_db) + 1}"
    
    teas_db[tea_id] = {
        "id": tea_id,
        "title": tea.title,
        "content": tea.content,
        "tag": tea.tag,
        "upvotes": 0,
        "downvotes": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {
        "message": "Tea posted successfully!",
        "tea": teas_db[tea_id]
    }

# Get all teas
@app.get("/tea", tags=["Tea"])
async def get_teas():
    tea_list = list(teas_db.values())
    # Sort by creation time (newest first)
    tea_list.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "teas": tea_list,
        "total": len(tea_list)
    }

# Vote on tea
@app.post("/tea/{tea_id}/vote", tags=["Tea"])
async def vote_tea(tea_id: str, vote: TeaVote):
    if tea_id not in teas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )
    
    if vote.vote_type == "upvote":
        teas_db[tea_id]["upvotes"] += 1
    elif vote.vote_type == "downvote":
        teas_db[tea_id]["downvotes"] += 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vote type"
        )
    
    return {
        "message": "Vote recorded!",
        "tea": teas_db[tea_id]
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

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    
    uvicorn.run(
        "main_simple:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )

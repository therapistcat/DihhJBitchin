from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username (3-50 characters)")
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    year: str = Field(..., pattern="^(26|27|28|29)$", description="Graduation year (26, 27, 28, or 29)")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123",
                "year": "27"
            }
        }

class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123"
            }
        }

class UserOut(BaseModel):
    username: str
    year: str
    id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "year": "27",
                "id": "507f1f77bcf86cd799439011"
            }
        }

class UserResponse(BaseModel):
    message: str
    user: Optional[UserOut] = None

    class Config:
        json_schema_extra = {
            "example": {
                "message": "User registered successfully",
                "user": {
                    "username": "john_doe",
                    "year": "27",
                    "id": "507f1f77bcf86cd799439011"
                }
            }
        }
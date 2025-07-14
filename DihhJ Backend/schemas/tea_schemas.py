from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SortType(str, Enum):
    HOT = "hot"
    NEW = "new"
    TOP = "top"
    CONTROVERSIAL = "controversial"

class TimeFilter(str, Enum):
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"
    ALL = "all"

class TeaTag(str, Enum):
    GENERAL = "general"
    INFORMATIVE = "informative"
    HARI_BITCH = "hari-bitch"
    SNITCHING_ON_MY_BESTIE = "snitching-on-my-bestie"
    DRAMA = "drama"
    CONFESSION = "confession"
    ADVICE = "advice"
    RANT = "rant"
    FUNNY = "funny"
    WHOLESOME = "wholesome"
    ACADEMIC = "academic"
    RELATIONSHIP = "relationship"
    FAMILY = "family"
    FRIENDS = "friends"
    WORK = "work"
    LIFE_UPDATE = "life-update"
    QUESTION = "question"
    DISCUSSION = "discussion"
    MEME = "meme"
    SERIOUS = "serious"

class TeaCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Tea title")
    content: str = Field(..., min_length=1, max_length=5000, description="Tea content")
    images: Optional[List[str]] = Field(default=[], description="List of image URLs")
    tags: Optional[List[str]] = Field(default=[], description="Tags for the tea post")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "My Amazing Tea Story",
                "content": "This is the content of my tea post...",
                "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
                "tags": ["general", "hari-bitch", "snitching-on-my-bestie"]
            }
        }

class TeaUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Tea title")
    content: Optional[str] = Field(None, min_length=1, max_length=5000, description="Tea content")
    images: Optional[List[str]] = Field(None, description="List of image URLs")
    tags: Optional[List[str]] = Field(None, description="Tags for the tea post")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Tea Story",
                "content": "Updated content...",
                "images": ["https://example.com/new_image.jpg"],
                "tags": ["updated", "informative"]
            }
        }

class TeaOut(BaseModel):
    id: str
    title: str
    content: str
    author_id: str
    author_username: str
    author_batch: str  # User's batch (25, 26, 27, etc.)
    images: List[str]
    tags: List[str]
    upvotes: int
    downvotes: int
    score: int  # upvotes - downvotes (Reddit-like score)
    comment_count: int
    created_at: datetime
    updated_at: datetime
    hot_score: Optional[float] = None  # For hot sorting algorithm

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "My Amazing Tea Story",
                "content": "This is the content of my tea post...",
                "author_id": "507f1f77bcf86cd799439012",
                "author_username": "john_doe",
                "author_batch": "27",
                "images": ["https://example.com/image1.jpg"],
                "tags": ["general", "hari-bitch"],
                "upvotes": 5,
                "downvotes": 1,
                "score": 4,
                "comment_count": 3,
                "created_at": "2024-01-01T12:00:00",
                "updated_at": "2024-01-01T12:00:00",
                "hot_score": 1.5
            }
        }

class TeaVote(BaseModel):
    vote_type: str = Field(..., pattern="^(upvote|downvote)$", description="Vote type: upvote or downvote")

    class Config:
        json_schema_extra = {
            "example": {
                "vote_type": "upvote"
            }
        }

class BitchCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Bitch comment content")
    parent_id: Optional[str] = Field(None, description="Parent comment ID for nested replies")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "This is my comment about this tea...",
                "parent_id": None  # or "507f1f77bcf86cd799439014" for a reply
            }
        }

class BitchUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Updated bitch comment content")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Updated comment content..."
            }
        }

class BitchOut(BaseModel):
    id: str
    content: str
    author_id: str
    author_username: str
    tea_id: str
    parent_id: Optional[str]
    upvotes: int
    downvotes: int
    score: int  # upvotes - downvotes
    depth: int  # How deep in the comment thread (0 = top level)
    reply_count: int  # Number of direct replies
    created_at: datetime
    updated_at: datetime
    replies: Optional[List['BitchOut']] = None  # Nested replies

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439013",
                "content": "This is my comment about this tea...",
                "author_id": "507f1f77bcf86cd799439012",
                "author_username": "john_doe",
                "tea_id": "507f1f77bcf86cd799439011",
                "parent_id": None,
                "upvotes": 3,
                "downvotes": 0,
                "score": 3,
                "depth": 0,
                "reply_count": 2,
                "created_at": "2024-01-01T12:00:00",
                "updated_at": "2024-01-01T12:00:00",
                "replies": []
            }
        }

class TeaResponse(BaseModel):
    message: str
    tea: Optional[TeaOut] = None

class BitchResponse(BaseModel):
    message: str
    bitch: Optional[BitchOut] = None

class TeaListResponse(BaseModel):
    message: str
    teas: List[TeaOut]
    total: int

class BitchListResponse(BaseModel):
    message: str
    bitches: List[BitchOut]
    total: int

class TagStats(BaseModel):
    tag: str
    count: int
    description: str

class TagListResponse(BaseModel):
    message: str
    available_tags: List[str]
    tag_stats: Optional[List[TagStats]] = None

class BatchStats(BaseModel):
    batch: str
    tea_count: int
    member_count: int

class BatchListResponse(BaseModel):
    message: str
    batches: List[BatchStats]

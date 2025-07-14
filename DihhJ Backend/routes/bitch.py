from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from datetime import datetime
from bson import ObjectId
from schemas.tea_schemas import (
    BitchCreate, BitchUpdate, BitchOut, BitchResponse, BitchListResponse
)
from database import bitch_collection, user_collection, tea_collection, bitch_votes_collection
import pymongo

router = APIRouter(prefix="/bitch", tags=["Bitch Comments"])

# Helper function to convert MongoDB document to BitchOut
def bitch_doc_to_out(doc: dict) -> BitchOut:
    return BitchOut(
        id=str(doc["_id"]),
        content=doc["content"],
        author_id=str(doc["author_id"]),
        author_username=doc["author_username"],
        tea_id=str(doc["tea_id"]),
        parent_id=str(doc["parent_id"]) if doc.get("parent_id") else None,
        upvotes=doc.get("upvotes", 0),
        downvotes=doc.get("downvotes", 0),
        score=doc.get("upvotes", 0) - doc.get("downvotes", 0),
        depth=doc.get("depth", 0),
        reply_count=doc.get("reply_count", 0),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        replies=None  # Will be populated separately if needed
    )

# Helper function to get user by username (simple auth check)
async def get_current_user(username: str):
    user = await user_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please login first."
        )
    return user

@router.post("/{tea_id}/create", response_model=BitchResponse)
async def create_bitch(
    tea_id: str,
    bitch: BitchCreate, 
    username: str = Query(..., description="Username of the comment author")
):
    """
    Create a new bitch comment on a tea post.
    
    - **tea_id**: ID of the tea post to comment on
    - **content**: Content of the comment
    - **username**: Username of the commenter (required for authentication)
    """
    # Verify user exists
    user = await get_current_user(username)
    
    # Verify tea exists
    try:
        tea = await tea_collection.find_one({"_id": ObjectId(tea_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tea ID format"
        )
    
    if not tea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )
    
    # Handle parent comment for threading
    parent_depth = 0
    if bitch.parent_id:
        try:
            parent_comment = await bitch_collection.find_one({"_id": ObjectId(bitch.parent_id)})
            if not parent_comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found"
                )
            if str(parent_comment["tea_id"]) != tea_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment is not from the same tea post"
                )
            parent_depth = parent_comment.get("depth", 0)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid parent comment ID format"
            )

    # Create bitch document
    bitch_doc = {
        "content": bitch.content,
        "author_id": user["_id"],
        "author_username": user["username"],
        "tea_id": ObjectId(tea_id),
        "parent_id": ObjectId(bitch.parent_id) if bitch.parent_id else None,
        "depth": parent_depth + 1 if bitch.parent_id else 0,
        "upvotes": 0,
        "downvotes": 0,
        "reply_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert bitch into database
    result = await bitch_collection.insert_one(bitch_doc)

    # Update parent comment reply count if this is a reply
    if bitch.parent_id:
        await bitch_collection.update_one(
            {"_id": ObjectId(bitch.parent_id)},
            {"$inc": {"reply_count": 1}}
        )

    # Update tea comment count
    await tea_collection.update_one(
        {"_id": ObjectId(tea_id)},
        {"$inc": {"comment_count": 1}}
    )

    # Get the created bitch
    created_bitch = await bitch_collection.find_one({"_id": result.inserted_id})

    return BitchResponse(
        message="Bitch comment created successfully!",
        bitch=bitch_doc_to_out(created_bitch)
    )

@router.get("/{tea_id}/list", response_model=BitchListResponse)
async def list_bitches(
    tea_id: str,
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of comments to return"),
    order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order by creation time: asc or desc")
):
    """
    Get all bitch comments for a specific tea post with pagination.
    """
    # Verify tea exists
    try:
        tea = await tea_collection.find_one({"_id": ObjectId(tea_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tea ID format"
        )
    
    if not tea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tea not found"
        )
    
    # Determine sort order
    sort_order = pymongo.ASCENDING if order == "asc" else pymongo.DESCENDING
    
    # Get total count for this tea
    total = await bitch_collection.count_documents({"tea_id": ObjectId(tea_id)})
    
    # Get bitches with pagination and sorting
    cursor = bitch_collection.find({"tea_id": ObjectId(tea_id)}).sort("created_at", sort_order).skip(skip).limit(limit)
    bitches = await cursor.to_list(length=limit)
    
    # Convert to BitchOut objects
    bitch_list = [bitch_doc_to_out(bitch) for bitch in bitches]
    
    return BitchListResponse(
        message=f"Retrieved {len(bitch_list)} bitch comments for tea",
        bitches=bitch_list,
        total=total
    )

@router.get("/comment/{bitch_id}", response_model=BitchResponse)
async def get_bitch(bitch_id: str):
    """
    Get a specific bitch comment by ID.
    """
    try:
        bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bitch comment ID format"
        )
    
    if not bitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bitch comment not found"
        )
    
    return BitchResponse(
        message="Bitch comment retrieved successfully",
        bitch=bitch_doc_to_out(bitch)
    )

@router.put("/comment/{bitch_id}", response_model=BitchResponse)
async def update_bitch(
    bitch_id: str, 
    bitch_update: BitchUpdate, 
    username: str = Query(..., description="Username of the comment owner")
):
    """
    Update a bitch comment. Only the author can update their comment.
    """
    # Verify user exists
    user = await get_current_user(username)
    
    try:
        # Check if bitch exists and user is the author
        bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bitch comment ID format"
        )
    
    if not bitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bitch comment not found"
        )
    
    if bitch["author_id"] != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own bitch comments"
        )
    
    # Update bitch
    await bitch_collection.update_one(
        {"_id": ObjectId(bitch_id)},
        {"$set": {"content": bitch_update.content, "updated_at": datetime.utcnow()}}
    )
    
    # Get updated bitch
    updated_bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    
    return BitchResponse(
        message="Bitch comment updated successfully!",
        bitch=bitch_doc_to_out(updated_bitch)
    )

@router.delete("/comment/{bitch_id}")
async def delete_bitch(bitch_id: str, username: str = Query(..., description="Username of the comment owner")):
    """
    Delete a bitch comment. Only the author can delete their comment.
    """
    # Verify user exists
    user = await get_current_user(username)
    
    try:
        # Check if bitch exists and user is the author
        bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bitch comment ID format"
        )
    
    if not bitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bitch comment not found"
        )
    
    if bitch["author_id"] != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own bitch comments"
        )
    
    # Delete bitch
    await bitch_collection.delete_one({"_id": ObjectId(bitch_id)})
    
    return {"message": "Bitch comment deleted successfully!"}

@router.get("/user/{username}", response_model=BitchListResponse)
async def get_user_bitches(
    username: str,
    skip: int = Query(0, ge=0, description="Number of comments to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of comments to return")
):
    """
    Get all bitch comments by a specific user.
    """
    # Verify user exists
    user = await user_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get total count for this user
    total = await bitch_collection.count_documents({"author_id": user["_id"]})
    
    # Get bitches with pagination
    cursor = bitch_collection.find({"author_id": user["_id"]}).sort("created_at", pymongo.DESCENDING).skip(skip).limit(limit)
    bitches = await cursor.to_list(length=limit)
    
    # Convert to BitchOut objects
    bitch_list = [bitch_doc_to_out(bitch) for bitch in bitches]
    
    return BitchListResponse(
        message=f"Retrieved {len(bitch_list)} bitch comments by {username}",
        bitches=bitch_list,
        total=total
    )

@router.post("/comment/{bitch_id}/vote")
async def vote_bitch(
    bitch_id: str,
    vote_type: str = Query(..., pattern="^(upvote|downvote)$", description="Vote type: upvote or downvote"),
    username: str = Query(..., description="Username of the voter")
):
    """
    Vote on a bitch comment (upvote or downvote).
    Users can change their vote or remove it by voting the same way again.
    """
    # Verify user exists
    user = await get_current_user(username)

    try:
        # Check if bitch exists
        bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bitch comment ID format"
        )

    if not bitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bitch comment not found"
        )

    # Check if user already voted on this comment
    existing_vote = await bitch_votes_collection.find_one({
        "bitch_id": ObjectId(bitch_id),
        "user_id": user["_id"]
    })

    if existing_vote:
        # User has already voted - don't allow multiple votes
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already voted on this comment with a {existing_vote['vote_type']}"
        )
    else:
        # Create new vote
        vote_doc = {
            "bitch_id": ObjectId(bitch_id),
            "user_id": user["_id"],
            "vote_type": vote_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await bitch_votes_collection.insert_one(vote_doc)

        # Update bitch vote counts
        if vote_type == "upvote":
            await bitch_collection.update_one(
                {"_id": ObjectId(bitch_id)},
                {"$inc": {"upvotes": 1}}
            )
        else:
            await bitch_collection.update_one(
                {"_id": ObjectId(bitch_id)},
                {"$inc": {"downvotes": 1}}
            )

        return {"message": f"{vote_type.capitalize()} added successfully!"}

@router.get("/comment/{bitch_id}/user-vote")
async def get_user_vote_status(
    bitch_id: str,
    username: str = Query(..., description="Username to check vote status for")
):
    """
    Get the current user's vote status for a comment.
    Returns the user's vote type or null if they haven't voted.
    """
    # Verify user exists
    user = await get_current_user(username)

    try:
        # Check if comment exists
        bitch = await bitch_collection.find_one({"_id": ObjectId(bitch_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bitch comment ID format"
        )

    if not bitch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bitch comment not found"
        )

    # Check if user has voted on this comment
    existing_vote = await bitch_votes_collection.find_one({
        "bitch_id": ObjectId(bitch_id),
        "user_id": user["_id"]
    })

    return {
        "bitch_id": bitch_id,
        "user_vote": existing_vote["vote_type"] if existing_vote else None,
        "has_voted": existing_vote is not None
    }

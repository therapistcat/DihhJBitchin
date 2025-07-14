from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from schemas.tea_schemas import (
    TeaCreate, TeaUpdate, TeaOut, TeaVote, TeaResponse, TeaListResponse,
    TagListResponse, TagStats, BatchListResponse, BatchStats, TeaTag,
    SortType, TimeFilter
)
from database import tea_collection, user_collection, tea_votes_collection
import pymongo
import math

router = APIRouter(prefix="/tea", tags=["Tea"])

# Helper function to calculate hot score (Reddit-like algorithm)
def calculate_hot_score(upvotes: int, downvotes: int, created_at: datetime) -> float:
    """
    Calculate hot score based on votes and time.
    Similar to Reddit's hot algorithm but simplified.
    """
    score = upvotes - downvotes

    # Time decay factor - posts lose relevance over time
    now = datetime.utcnow()
    age_hours = (now - created_at).total_seconds() / 3600

    # Base score with logarithmic scaling for votes
    if score > 0:
        base_score = math.log10(max(score, 1))
    elif score < 0:
        base_score = -math.log10(max(abs(score), 1))
    else:
        base_score = 0

    # Time decay - posts lose 50% relevance every 12 hours
    time_factor = math.pow(0.5, age_hours / 12)

    # Engagement boost for comments
    comment_boost = 1.0  # Will be updated when comment_count is available

    return base_score * time_factor * comment_boost

# Helper function to get time filter datetime
def get_time_filter_datetime(time_filter: str) -> Optional[datetime]:
    """Convert time filter string to datetime for filtering."""
    if not time_filter or time_filter == "all":
        return None

    now = datetime.utcnow()
    time_deltas = {
        "hour": timedelta(hours=1),
        "day": timedelta(days=1),
        "week": timedelta(weeks=1),
        "month": timedelta(days=30),
        "year": timedelta(days=365)
    }

    if time_filter in time_deltas:
        return now - time_deltas[time_filter]
    return None

# Helper function to convert MongoDB document to TeaOut
def tea_doc_to_out(doc: dict) -> TeaOut:
    return TeaOut(
        id=str(doc["_id"]),
        title=doc["title"],
        content=doc["content"],
        author_id=str(doc["author_id"]),
        author_username=doc["author_username"],
        author_batch=doc.get("author_batch", "unknown"),
        images=doc.get("images", []),
        tags=doc.get("tags", []),
        upvotes=doc.get("upvotes", 0),
        downvotes=doc.get("downvotes", 0),
        score=doc.get("upvotes", 0) - doc.get("downvotes", 0),
        comment_count=doc.get("comment_count", 0),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        hot_score=doc.get("hot_score")
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

@router.post("/create", response_model=TeaResponse)
async def create_tea(tea: TeaCreate, username: str = Query(..., description="Username of the tea creator")):
    """
    Create a new tea post.
    
    - **title**: Title of the tea post
    - **content**: Content of the tea post
    - **images**: Optional list of image URLs
    - **username**: Username of the creator (required for authentication)
    """
    # Verify user exists
    user = await get_current_user(username)
    
    # Validate tags
    valid_tags = [tag.value for tag in TeaTag]
    if tea.tags:
        invalid_tags = [tag for tag in tea.tags if tag not in valid_tags]
        if invalid_tags:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tags: {invalid_tags}. Valid tags are: {valid_tags}"
            )

    # Create tea document
    tea_doc = {
        "title": tea.title,
        "content": tea.content,
        "author_id": user["_id"],
        "author_username": user["username"],
        "author_batch": user["year"],  # Use the year from user registration as batch
        "images": tea.images or [],
        "tags": tea.tags or [],
        "upvotes": 0,
        "downvotes": 0,
        "score": 0,
        "comment_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert tea into database
    result = await tea_collection.insert_one(tea_doc)
    
    # Get the created tea
    created_tea = await tea_collection.find_one({"_id": result.inserted_id})
    
    return TeaResponse(
        message="Tea created successfully!",
        tea=tea_doc_to_out(created_tea)
    )

@router.get("/tags", response_model=TagListResponse)
async def get_available_tags(include_stats: bool = Query(False, description="Include usage statistics for each tag")):
    """
    Get all available tags for tea posts.

    - **include_stats**: If true, includes usage statistics for each tag
    """
    available_tags = [tag.value for tag in TeaTag]

    tag_stats = None
    if include_stats:
        # Get tag usage statistics
        pipeline = [
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]

        stats_cursor = tea_collection.aggregate(pipeline)
        stats_data = await stats_cursor.to_list(length=None)

        # Create tag descriptions
        tag_descriptions = {
            "general": "General discussions and everyday topics",
            "informative": "Educational or informative content",
            "hari-bitch": "Daily complaints and minor frustrations",
            "snitching-on-my-bestie": "Sharing secrets about friends (anonymously)",
            "drama": "Dramatic situations and conflicts",
            "confession": "Personal confessions and admissions",
            "advice": "Seeking or giving advice",
            "rant": "Venting and expressing frustrations",
            "funny": "Humorous content and jokes",
            "wholesome": "Positive and heartwarming content",
            "academic": "School, studies, and academic life",
            "relationship": "Dating, romance, and relationships",
            "family": "Family-related topics",
            "friends": "Friendship and social circles",
            "work": "Job and career-related topics",
            "life-update": "Personal life updates and milestones",
            "question": "Questions seeking answers",
            "discussion": "Open discussions and debates",
            "meme": "Memes and internet culture",
            "serious": "Serious and important topics"
        }

        tag_stats = []
        for stat in stats_data:
            tag_stats.append(TagStats(
                tag=stat["_id"],
                count=stat["count"],
                description=tag_descriptions.get(stat["_id"], "No description available")
            ))

    return TagListResponse(
        message="Available tags retrieved successfully",
        available_tags=available_tags,
        tag_stats=tag_stats
    )

@router.get("/batches", response_model=BatchListResponse)
async def get_batch_stats():
    """
    Get statistics for all batches (like different subreddits for each batch).
    """
    # Get batch statistics
    pipeline = [
        {"$group": {
            "_id": "$author_batch",
            "tea_count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]

    batch_cursor = tea_collection.aggregate(pipeline)
    batch_data = await batch_cursor.to_list(length=None)

    # Get member count for each batch from user collection
    batches = []
    for batch in batch_data:
        if batch["_id"]:  # Skip null batches
            member_count = await user_collection.count_documents({"year": batch["_id"]})
            batches.append(BatchStats(
                batch=batch["_id"],
                tea_count=batch["tea_count"],
                member_count=member_count
            ))

    return BatchListResponse(
        message="Batch statistics retrieved successfully",
        batches=batches
    )

@router.get("/trending-tags")
async def get_trending_tags(
    days: int = Query(7, ge=1, le=30, description="Number of days to look back for trending tags")
):
    """
    Get trending tags based on recent usage.
    """
    from datetime import timedelta

    # Calculate date threshold
    date_threshold = datetime.utcnow() - timedelta(days=days)

    # Get trending tags from recent posts
    pipeline = [
        {"$match": {"created_at": {"$gte": date_threshold}}},
        {"$unwind": "$tags"},
        {"$group": {
            "_id": "$tags",
            "count": {"$sum": 1},
            "avg_score": {"$avg": "$score"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]

    trending_cursor = tea_collection.aggregate(pipeline)
    trending_data = await trending_cursor.to_list(length=None)

    trending_tags = []
    for tag_data in trending_data:
        trending_tags.append({
            "tag": tag_data["_id"],
            "usage_count": tag_data["count"],
            "avg_score": round(tag_data["avg_score"], 2)
        })

    return {
        "message": f"Trending tags for the last {days} days",
        "trending_tags": trending_tags,
        "period_days": days
    }

@router.get("/list", response_model=TeaListResponse)
async def list_teas(
    skip: int = Query(0, ge=0, description="Number of teas to skip"),
    limit: int = Query(10, ge=1, le=50, description="Number of teas to return"),
    sort_by: str = Query("hot", description="Sort by: hot, new, top, score, created_at, upvotes, title"),
    order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order: asc or desc"),
    batch: Optional[str] = Query(None, description="Filter by batch (25, 26, 27, 28, 29)"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    time_filter: Optional[str] = Query(None, description="Filter by time: hour, day, week, month, year, all")
):
    """
    Get a list of tea posts with advanced filtering, pagination and sorting.

    - **sort_by**: hot (Reddit-like hot algorithm), new (newest first), top (highest score), score, created_at, upvotes, title
    - **batch**: Filter by specific batch (25, 26, 27, 28, 29)
    - **tags**: Filter by tags (comma-separated, e.g., "general,hari-bitch")
    - **search**: Search in title and content
    - **time_filter**: Filter by time period (hour, day, week, month, year, all)
    """
    # Build filter query
    filter_query = {}

    # Filter by batch
    if batch:
        filter_query["author_batch"] = batch

    # Filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        filter_query["tags"] = {"$in": tag_list}

    # Search functionality
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]

    # Time filtering
    time_cutoff = get_time_filter_datetime(time_filter)
    if time_cutoff:
        filter_query["created_at"] = {"$gte": time_cutoff}

    # Determine sort order
    sort_order = pymongo.ASCENDING if order == "asc" else pymongo.DESCENDING

    # Get total count with filters
    total = await tea_collection.count_documents(filter_query)

    # Handle special sorting
    if sort_by == "hot":
        # For hot sorting, we need to calculate hot scores dynamically
        # Get all matching documents first
        cursor = tea_collection.find(filter_query)
        all_teas = await cursor.to_list(length=None)

        # Calculate hot scores and sort
        for tea in all_teas:
            tea["hot_score"] = calculate_hot_score(
                tea.get("upvotes", 0),
                tea.get("downvotes", 0),
                tea["created_at"]
            )

        # Sort by hot score
        all_teas.sort(key=lambda x: x["hot_score"], reverse=(order == "desc"))

        # Apply pagination
        teas = all_teas[skip:skip + limit]
    else:
        # Standard sorting
        if sort_by == "new":
            sort_field = "created_at"
        elif sort_by == "top":
            sort_field = "score"
        else:
            sort_field = sort_by

        # Get teas with pagination and sorting
        cursor = tea_collection.find(filter_query).sort(sort_field, sort_order).skip(skip).limit(limit)
        teas = await cursor.to_list(length=limit)

    # Convert to TeaOut objects and include hot scores
    tea_list = []
    for tea in teas:
        tea_out = tea_doc_to_out(tea)
        # Add hot score if it was calculated
        if "hot_score" in tea:
            tea_out.hot_score = tea["hot_score"]
        tea_list.append(tea_out)

    return TeaListResponse(
        message=f"Retrieved {len(tea_list)} teas",
        teas=tea_list,
        total=total
    )

@router.get("/{tea_id}", response_model=TeaResponse)
async def get_tea(tea_id: str):
    """
    Get a specific tea post by ID.
    """
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
    
    return TeaResponse(
        message="Tea retrieved successfully",
        tea=tea_doc_to_out(tea)
    )

@router.put("/{tea_id}", response_model=TeaResponse)
async def update_tea(
    tea_id: str, 
    tea_update: TeaUpdate, 
    username: str = Query(..., description="Username of the tea owner")
):
    """
    Update a tea post. Only the author can update their tea.
    """
    # Verify user exists
    user = await get_current_user(username)
    
    try:
        # Check if tea exists and user is the author
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
    
    if tea["author_id"] != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own tea posts"
        )
    
    # Validate tags if provided
    if tea_update.tags is not None:
        valid_tags = [tag.value for tag in TeaTag]
        invalid_tags = [tag for tag in tea_update.tags if tag not in valid_tags]
        if invalid_tags:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tags: {invalid_tags}. Valid tags are: {valid_tags}"
            )

    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    if tea_update.title is not None:
        update_data["title"] = tea_update.title
    if tea_update.content is not None:
        update_data["content"] = tea_update.content
    if tea_update.images is not None:
        update_data["images"] = tea_update.images
    if tea_update.tags is not None:
        update_data["tags"] = tea_update.tags
    
    # Update tea
    await tea_collection.update_one(
        {"_id": ObjectId(tea_id)},
        {"$set": update_data}
    )
    
    # Get updated tea
    updated_tea = await tea_collection.find_one({"_id": ObjectId(tea_id)})
    
    return TeaResponse(
        message="Tea updated successfully!",
        tea=tea_doc_to_out(updated_tea)
    )

@router.delete("/{tea_id}")
async def delete_tea(tea_id: str, username: str = Query(..., description="Username of the tea owner")):
    """
    Delete a tea post. Only the author can delete their tea.
    """
    # Verify user exists
    user = await get_current_user(username)
    
    try:
        # Check if tea exists and user is the author
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
    
    if tea["author_id"] != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own tea posts"
        )
    
    # Delete tea
    await tea_collection.delete_one({"_id": ObjectId(tea_id)})
    
    # Also delete all votes for this tea
    await tea_votes_collection.delete_many({"tea_id": ObjectId(tea_id)})
    
    return {"message": "Tea deleted successfully!"}

@router.post("/{tea_id}/vote")
async def vote_tea(
    tea_id: str,
    vote: TeaVote,
    username: str = Query(..., description="Username of the voter")
):
    """
    Vote on a tea post (upvote or downvote).
    Users can change their vote or remove it by voting the same way again.
    """
    # Verify user exists
    user = await get_current_user(username)

    try:
        # Check if tea exists
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

    # Check if user already voted on this tea
    existing_vote = await tea_votes_collection.find_one({
        "tea_id": ObjectId(tea_id),
        "user_id": user["_id"]
    })

    if existing_vote:
        # User has already voted - don't allow multiple votes
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already voted on this post with a {existing_vote['vote_type']}"
        )
    else:
        # Create new vote
        vote_doc = {
            "tea_id": ObjectId(tea_id),
            "user_id": user["_id"],
            "vote_type": vote.vote_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await tea_votes_collection.insert_one(vote_doc)

        # Update tea vote counts
        if vote.vote_type == "upvote":
            await tea_collection.update_one(
                {"_id": ObjectId(tea_id)},
                {"$inc": {"upvotes": 1}}
            )
        else:
            await tea_collection.update_one(
                {"_id": ObjectId(tea_id)},
                {"$inc": {"downvotes": 1}}
            )

        return {"message": f"{vote.vote_type.capitalize()} added successfully!"}

@router.get("/{tea_id}/votes")
async def get_tea_votes(tea_id: str):
    """
    Get vote statistics for a tea post.
    """
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

    return {
        "tea_id": tea_id,
        "upvotes": tea.get("upvotes", 0),
        "downvotes": tea.get("downvotes", 0),
        "total_votes": tea.get("upvotes", 0) + tea.get("downvotes", 0)
    }

@router.get("/{tea_id}/user-vote")
async def get_user_vote_status(
    tea_id: str,
    username: str = Query(..., description="Username to check vote status for")
):
    """
    Get the current user's vote status for a tea post.
    Returns the user's vote type or null if they haven't voted.
    """
    # Verify user exists
    user = await get_current_user(username)

    try:
        # Check if tea exists
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

    # Check if user has voted on this tea
    existing_vote = await tea_votes_collection.find_one({
        "tea_id": ObjectId(tea_id),
        "user_id": user["_id"]
    })

    return {
        "tea_id": tea_id,
        "user_vote": existing_vote["vote_type"] if existing_vote else None,
        "has_voted": existing_vote is not None
    }



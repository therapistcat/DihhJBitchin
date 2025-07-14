from fastapi import APIRouter, HTTPException, status
from schemas.user_schemas import UserCreate, UserOut, UserResponse
from database import user_collection
from utils.hashing import hash_password
from pymongo.errors import DuplicateKeyError

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """
    Register a new user with username, password, and graduation year.

    - **username**: Must be 3-50 characters long and unique
    - **password**: Must be at least 6 characters long
    - **year**: Must be one of: 26, 27, 28, 29 (graduation year)
    """
    # Check if username already exists
    existing_user = await user_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Please choose a different username."
        )

    # Create user document
    user_dict = {
        "username": user.username,
        "password": hash_password(user.password),
        "year": user.year
    }

    # Insert user into database
    try:
        result = await user_collection.insert_one(user_dict)
    except DuplicateKeyError:
        # This handles the case where the unique index catches a duplicate username
        # that might have been inserted between our check and insert
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Please choose a different username."
        )

    # Create response
    user_out = UserOut(
        username=user.username,
        year=user.year,
        id=str(result.inserted_id)
    )

    return UserResponse(
        message="User registered successfully!",
        user=user_out
    )
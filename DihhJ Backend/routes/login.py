from fastapi import APIRouter, HTTPException, status
from schemas.user_schemas import UserLogin, UserOut, UserResponse
from database import user_collection, run_sync
from utils.hashing import verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
async def login(user: UserLogin):
    """
    Login with username and password.

    - **username**: Your registered username
    - **password**: Your password
    """
    # Find user in database
    user_data = await run_sync(user_collection.find_one, {"username": user.username})

    # Check if user exists and password is correct
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create user output
    user_out = UserOut(
        username=user_data["username"],
        year=user_data["year"],
        id=str(user_data["_id"])
    )

    return UserResponse(
        message=f"Welcome back, {user.username}!",
        user=user_out
    )
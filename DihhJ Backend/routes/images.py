from fastapi import APIRouter, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
import os
import uuid
from typing import List
import shutil
from pathlib import Path

router = APIRouter(prefix="/images", tags=["Images"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile) -> bool:
    """Validate if the uploaded file is a valid image"""
    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    # Check content type
    if not file.content_type or not file.content_type.startswith("image/"):
        return False
    
    return True

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    username: str = Query(..., description="Username of the uploader")
):
    """
    Upload an image file.
    
    - **file**: Image file to upload (jpg, jpeg, png, gif, webp)
    - **username**: Username of the uploader (for tracking)
    
    Returns the URL to access the uploaded image.
    """
    # Validate file
    if not validate_image(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return the URL to access the image
    image_url = f"/images/view/{unique_filename}"
    
    return {
        "message": "Image uploaded successfully!",
        "filename": unique_filename,
        "url": image_url,
        "size": len(file_content),
        "uploader": username
    }

@router.post("/upload-multiple")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    username: str = Query(..., description="Username of the uploader")
):
    """
    Upload multiple image files at once.
    
    - **files**: List of image files to upload
    - **username**: Username of the uploader (for tracking)
    
    Returns URLs to access the uploaded images.
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    uploaded_images = []
    failed_uploads = []
    
    for file in files:
        try:
            # Validate file
            if not validate_image(file):
                failed_uploads.append({
                    "filename": file.filename,
                    "error": f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                })
                continue
            
            # Check file size
            file_content = await file.read()
            if len(file_content) > MAX_FILE_SIZE:
                failed_uploads.append({
                    "filename": file.filename,
                    "error": f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                })
                continue
            
            # Generate unique filename
            file_extension = Path(file.filename).suffix.lower()
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            
            # Add to successful uploads
            uploaded_images.append({
                "original_filename": file.filename,
                "filename": unique_filename,
                "url": f"/images/view/{unique_filename}",
                "size": len(file_content)
            })
            
        except Exception as e:
            failed_uploads.append({
                "filename": file.filename,
                "error": f"Failed to save file: {str(e)}"
            })
    
    return {
        "message": f"Uploaded {len(uploaded_images)} images successfully",
        "uploaded_images": uploaded_images,
        "failed_uploads": failed_uploads,
        "uploader": username
    }

@router.get("/view/{filename}")
async def view_image(filename: str):
    """
    View an uploaded image by filename.
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return FileResponse(
        path=file_path,
        media_type="image/*",
        filename=filename
    )

@router.delete("/delete/{filename}")
async def delete_image(
    filename: str,
    username: str = Query(..., description="Username of the deleter")
):
    """
    Delete an uploaded image.
    Note: In a production environment, you should add proper authorization
    to ensure only the uploader or admin can delete images.
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    try:
        os.remove(file_path)
        return {
            "message": "Image deleted successfully!",
            "filename": filename,
            "deleted_by": username
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )

@router.get("/list")
async def list_images():
    """
    List all uploaded images.
    Note: In a production environment, you might want to add pagination
    and user-specific filtering.
    """
    try:
        image_files = []
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                stat = file_path.stat()
                image_files.append({
                    "filename": file_path.name,
                    "url": f"/images/view/{file_path.name}",
                    "size": stat.st_size,
                    "created_at": stat.st_ctime
                })
        
        # Sort by creation time (newest first)
        image_files.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {
            "message": f"Found {len(image_files)} images",
            "images": image_files
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {str(e)}"
        )

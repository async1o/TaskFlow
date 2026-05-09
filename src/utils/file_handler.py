import os
import uuid

from fastapi import UploadFile, HTTPException


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "avatars")


async def save_avatar(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, WebP images are allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    ext = os.path.splitext(file.filename or "avatar.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(content)

    return f"/static/avatars/{filename}"

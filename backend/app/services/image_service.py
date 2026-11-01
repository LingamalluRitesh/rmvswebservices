import io
import base64
from typing import Optional
from PIL import Image, ImageOps

SUPPORTED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP", "GIF", "BMP"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB max raw upload

def optimize_avatar_image(
    file_bytes: bytes,
    max_dimension: int = 512,
    quality: int = 85
) -> str:
    """
    Takes raw image bytes from an uploaded device file (camera, gallery, computer file),
    corrects EXIF rotation, center-crops to a 1:1 square, resizes to high-res (max_dimension),
    and converts to an ultra-compact, high-fidelity WebP base64 Data URI for permanent
    cloud database storage across all devices.
    """
    if not file_bytes:
        raise ValueError("Image file is empty")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"Image file exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB")

    try:
        img = Image.open(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError("Invalid image file format") from e

    # Auto-orient based on mobile/camera EXIF tags
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # Handle color channels
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        # Has transparency, convert to RGBA
        img = img.convert("RGBA")
        format_type = "WEBP"
    else:
        # Standard RGB
        img = img.convert("RGB")
        format_type = "WEBP"

    # Center crop to 1:1 square
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    img = img.crop((left, top, right, bottom))

    # Resize if larger than max_dimension
    if min_dim > max_dimension:
        img = img.resize((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    # Encode to WebP
    buffer = io.BytesIO()
    img.save(buffer, format=format_type, quality=quality, method=6)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/webp;base64,{encoded}"


def decode_avatar_data_uri(data_uri: str) -> tuple[bytes, str]:
    """
    Decodes a base64 Data URI into raw binary bytes and mime-type.
    """
    if not data_uri.startswith("data:"):
        raise ValueError("Not a valid data URI")

    header, encoded = data_uri.split(",", 1)
    mime_type = header.split(";")[0].replace("data:", "")
    raw_bytes = base64.b64decode(encoded)
    return raw_bytes, mime_type

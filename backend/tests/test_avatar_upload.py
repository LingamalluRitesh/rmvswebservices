import io
import pytest
from PIL import Image
from app.services.image_service import optimize_avatar_image, decode_avatar_data_uri

def test_optimize_avatar_image():
    # Create test raw image
    img = Image.new("RGB", (800, 600), color=(255, 100, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    raw_bytes = buf.getvalue()

    # Optimize
    data_uri = optimize_avatar_image(raw_bytes, max_dimension=512, quality=85)
    assert data_uri.startswith("data:image/webp;base64,")

    # Decode and verify dimensions
    decoded_bytes, mime = decode_avatar_data_uri(data_uri)
    assert mime == "image/webp"
    assert len(decoded_bytes) > 0

    decoded_img = Image.open(io.BytesIO(decoded_bytes))
    # It must be square and cropped to min dimension or max_dimension (512x512)
    assert decoded_img.size == (512, 512)

def test_optimize_avatar_rejects_empty():
    with pytest.raises(ValueError, match="empty"):
        optimize_avatar_image(b"")

def test_optimize_avatar_rejects_corrupted():
    with pytest.raises(ValueError, match="Invalid image"):
        optimize_avatar_image(b"not an image file")

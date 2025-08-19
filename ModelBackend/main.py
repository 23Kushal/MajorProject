import uuid
import io

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw, ImageFont

# Initialize the FastAPI app
app = FastAPI(title="Simple ML Model Server")

def process_image_with_ml_model(image: Image.Image, request_id: str) -> Image.Image:
    """
    This is a MOCK function to simulate ML model processing.
    
    In a real-world scenario, you would replace this logic with calls to your
    actual model (e.g., TensorFlow, PyTorch, scikit-learn).

    For this example, we will:
    1. Convert the image to grayscale.
    2. Draw the received UUID on the image.
    """
    print(f"Processing image for UUID: {request_id}...")

    # 1. Convert to grayscale to simulate a style transfer or filter
    processed_image = image.convert("L")

    # 2. Draw the UUID onto the image to confirm it was processed
    draw = ImageDraw.Draw(processed_image)
    try:
        # Use a default font. For better results, provide a path to a .ttf file
        font = ImageFont.load_default()
    except IOError:
        font = None
    
    text_position = (10, 10) # Top-left corner
    text_color = 255 # White for grayscale
    draw.text(text_position, f"UUID: {request_id}", fill=text_color, font=font)
    
    print("Processing complete.")
    return processed_image


@app.post("/process-image/")
async def create_upload_file(
    image: UploadFile = File(..., description="The image file to process."),
    request_uuid: uuid.UUID = Form(..., description="The unique ID for this request.")
):
    """
    Receives an image and a UUID, processes the image using a simulated ML model,
    and returns the processed image.
    """
    # 1. Read the uploaded image file's contents into memory
    contents = await image.read()

    # 2. Open the image using Pillow (Python Imaging Library)
    # io.BytesIO creates an in-memory binary stream from the byte contents
    original_image = Image.open(io.BytesIO(contents))

    # 3. "Hit the model" - Pass the image to our processing function
    processed_image_pil = process_image_with_ml_model(original_image, str(request_uuid))

    # 4. Save the processed image to an in-memory buffer
    output_buffer = io.BytesIO()
    processed_image_pil.save(output_buffer, format="JPEG")
    output_buffer.seek(0) # Rewind the buffer to the beginning

    # 5. Return the processed image as a streaming response
    # The media_type tells the client (your Node server) to treat this as a JPEG image.
    return StreamingResponse(output_buffer, media_type="image/jpeg")

@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "ML Server is running"}
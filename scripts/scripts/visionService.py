# scripts/visionService.py

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from transformers import BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel
from PIL import Image
from io import BytesIO
import torch

app = FastAPI()

# 🚀 Cargar BLIP para captioning
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# 🚀 Cargar CLIP para texto embedding
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")

@app.post("/describe_and_embed")
async def describe_and_embed(file: UploadFile = File(...)):
    # Leer imagen
    img_bytes = await file.read()
    raw_image = Image.open(BytesIO(img_bytes)).convert('RGB')

    # 1️⃣ Caption con BLIP
    inputs = blip_processor(raw_image, return_tensors="pt")
    out = blip_model.generate(**inputs)
    description = blip_processor.decode(out[0], skip_special_tokens=True)

    # 2️⃣ Embedding de texto con CLIP
    inputs = clip_processor(text=[description], return_tensors="pt", padding=True)
    with torch.no_grad():
        embedding = clip_model.get_text_features(**inputs)
    embedding = embedding[0].cpu().tolist()

    return JSONResponse({
        "description": description,
        "embedding": embedding
    })

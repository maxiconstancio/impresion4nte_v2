# clip_generate_embeddings.py

import os
import psycopg2
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO
import json

# ⚙️ Config DB (ajustá con tus credenciales)
DB = {
    'dbname': 'impresion4nte_v2',
    'user': 'impresion4nte',
    'password': 'superseguro123',
    'host': '192.168.1.12',
    'port': 5432
}

# 👉 Carga modelo CLIP
print('⏳ Cargando CLIP...')
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print('✅ CLIP listo.')

# 👉 Conexión DB
conn = psycopg2.connect(**DB)
cur = conn.cursor()

# 👉 Busca productos sin embedding real
cur.execute("SELECT id, image_url FROM \"Productos\" WHERE embedding IS NULL;")
productos = cur.fetchall()
print(f'🔎 {len(productos)} productos sin embedding.')

for prod in productos:
    prod_id, image_url = prod
    print(f'📸 ID={prod_id} | URL={image_url}')

    try:
        if image_url.startswith('file://'):
                local_path = f"/app{local_path}"
            image = Image.open(local_path).convert("RGB")
        else:
            response = requests.get(image_url)
            image = Image.open(BytesIO(response.content)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")
        outputs = model.get_image_features(**inputs)
        embedding = outputs[0].tolist()

        # Guarda en DB como JSON
        cur.execute(
            "UPDATE \"Productos\" SET embedding = %s WHERE id = %s",
            (json.dumps(embedding), prod_id)
        )
        conn.commit()
        print(f'✅ Embedding guardado para ID={prod_id}')

    except Exception as e:
        print(f'❌ Error en ID={prod_id}: {str(e)}')

cur.close()
conn.close()
print('🎉 ¡Proceso completado!')

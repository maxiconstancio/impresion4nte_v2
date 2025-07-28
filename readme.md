# 🚀 Impresion4nte — Chuleta Docker 🐳

## 📦 Servicios

| Servicio | Función | Puerto |
|----------|---------|--------|
| backend  | Node.js API | 3002 |
| frontend | Web App | 80 |
| vision   | BLIP + CLIP Python | 8000 |

## 🔑 Comandos básicos

```bash
# Actualizar imágenes backend & frontend del Docker Hub
docker compose pull backend frontend

# Construir vision (local)
docker compose build vision

# Levantar todo
docker compose up -d --build

# Ver estado
docker compose ps

# Detener todo
docker compose down

# Logs
docker compose logs -f backend
docker compose logs -f vision

# Ejecutar script batch
docker compose run --rm vision python clip_generate_embeddings.py

# Usa imagen oficial liviana
FROM python:3.10-slim

WORKDIR /app

# Dependencias de sistema para PIL y Psycopg2
RUN apt-get update && \
    apt-get install -y libgl1-mesa-glx libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Copia scripts y requirements
COPY . .

# Instala Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Por defecto: arranca API visionService
CMD ["uvicorn", "visionService:app", "--host", "0.0.0.0", "--port", "8000", "--limit-max-request-size", "20"]

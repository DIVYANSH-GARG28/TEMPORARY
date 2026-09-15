FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for GDAL/GeoPandas and PostgreSQL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

COPY requirements.txt .
# PyTorch removed completely to save data
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

COPY src/ /app/src/
COPY init_db.py /app/init_db.py

CMD ["sh", "-c", "python init_db.py && uvicorn src.main:app --host 0.0.0.0 --port 8000"]

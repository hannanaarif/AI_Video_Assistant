FROM python:3.10-slim

# Install system dependencies including FFmpeg and git
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Create necessary runtime directories
RUN mkdir -p downloads vector_db

# Expose default port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run API server
CMD ["python", "api_server.py"]

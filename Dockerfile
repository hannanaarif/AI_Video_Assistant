FROM python:3.10-slim

# Install system dependencies including FFmpeg and git
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Explicitly copy requirements.txt first
COPY requirements.txt /app/requirements.txt

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy remaining project files
COPY . /app/

# Create runtime directories
RUN mkdir -p downloads vector_db

# Expose default port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run API server
CMD ["python", "api_server.py"]

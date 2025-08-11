FROM python:3.11-slim

# Install FFmpeg and system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg gcc libsndfile1-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Run the FastAPI app with live reload (you can remove --reload for production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

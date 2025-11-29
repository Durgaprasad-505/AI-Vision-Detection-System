# Base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first (for caching)
# COPY requirements.txt /app/

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
# RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Install YOLOv5 dependencies if needed
RUN pip install --no-cache-dir Django>=4.2 torch torchvision ultralytics>=8.0 opencv-python numpy matplotlib pandas seaborn tqdm

# Expose Django port
EXPOSE 8000

# Run migrations and start server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

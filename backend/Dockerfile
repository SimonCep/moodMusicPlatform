# Use an official Python image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# Added libssl-dev, build-essential, and python3-dev for pyOpenSSL and other C-extension packages
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libssl-dev \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY geoip_data /app/geoip_data/
COPY requirements.txt /app/
RUN pip install --upgrade pip
# Use --no-cache-dir to ensure fresh downloads and rebuilds if necessary
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project files
COPY . /app

# Create directory for SSL certificates
RUN mkdir -p /app/certs

# Expose the port Gunicorn will listen on
EXPOSE 8000

# Start Gunicorn with SSL
CMD ["gunicorn", "--config", "gunicorn.conf.py", "backend.wsgi:application"]
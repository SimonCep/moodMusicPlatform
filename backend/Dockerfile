# Use an official Python image
FROM python:3.13

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY geoip_data /app/geoip_data/
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy Django project files
COPY . /app

# Run Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
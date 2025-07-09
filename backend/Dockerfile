# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your source
COPY main.py /app/
COPY api/ /app/api/

# Expose your app’s port
EXPOSE 8000

# Run your Flask app via Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "main:app"]

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if any needed for python packages)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create a directory for the database if it doesn't exist (persistence handled by volume mount)
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

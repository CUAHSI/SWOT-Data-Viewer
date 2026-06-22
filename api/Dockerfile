FROM python:3.10-slim

# Ensure all system packages are up to date to reduce vulnerabilities
RUN apt-get update \
 && apt-get upgrade -y \
 && apt-get clean

# Install system dependencies (required for Google Cloud SDK)
RUN apt-get update && apt-get install -y \
    curl \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# remove requirements-dev installation for deployments
COPY requirements-dev.txt requirements-dev.txt
RUN pip install -r requirements-dev.txt

RUN curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc \
 && chmod +x /usr/local/bin/mc

COPY ./swotvis /swotvis

ENV PYTHONPATH "/swotvis/:${PYTHONPATH}"

EXPOSE 8000

CMD uvicorn --host 0.0.0.0 --port 8000 --proxy-headers main:app

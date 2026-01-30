# ═════════════════════════════════════════════════════════════════════
# SHINKOFA - SHIZEN-PLANNER SERVICE DOCKERFILE (Multi-stage, GPU-enabled)
# ═════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────
# STAGE 1: DEVELOPMENT (with auto-reload)
# ─────────────────────────────────────────────────────────────────────
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 as development

WORKDIR /app

# Install Python 3.11 and system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3-pip \
    gcc \
    g++ \
    postgresql-client \
    curl \
    git \
    tesseract-ocr \
    tesseract-ocr-fra \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Upgrade pip
RUN python -m pip install --no-cache-dir --upgrade pip

# Copy requirements
COPY requirements.txt requirements-gpu.txt ./

# Install Python dependencies (GPU version)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements-gpu.txt

# Copy application code
COPY . .

# Create models directory
RUN mkdir -p /app/models

# Expose port
EXPOSE 8001

# Command will be overridden by docker-compose
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]


# ─────────────────────────────────────────────────────────────────────
# STAGE 2: PRODUCTION (optimized, GPU-enabled)
# ─────────────────────────────────────────────────────────────────────
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 as production

WORKDIR /app

# Install Python 3.11 and system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3-pip \
    gcc \
    g++ \
    postgresql-client \
    curl \
    git \
    tesseract-ocr \
    tesseract-ocr-fra \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Upgrade pip
RUN python -m pip install --no-cache-dir --upgrade pip

# Copy requirements
COPY requirements.txt requirements-gpu.txt ./

# Install Python dependencies (GPU version)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements-gpu.txt

# Copy application code
COPY ./app ./app

# Copy Alembic files for migrations
COPY ./alembic ./alembic
COPY ./alembic.ini .

# Create models directory
RUN mkdir -p /app/models

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]

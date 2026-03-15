#!/bin/bash
# Takdi Mac Mini M4 one-click setup script
# Usage: bash scripts/setup-mac.sh
# Prerequisites: macOS, internet connection
set -euo pipefail

echo "========================================="
echo "  Takdi Mac Mini Setup"
echo "========================================="
echo ""

# 1. Check Docker Desktop
echo "[1/5] Checking Docker Desktop..."
if ! command -v docker &> /dev/null; then
  echo ""
  echo "  Docker Desktop is not installed."
  echo "  Please install it from: https://www.docker.com/products/docker-desktop/"
  echo "  After installation, open Docker Desktop and wait for it to start."
  echo ""
  echo "  Then run this script again."
  exit 1
fi

if ! docker info &> /dev/null 2>&1; then
  echo ""
  echo "  Docker Desktop is installed but not running."
  echo "  Please open Docker Desktop and wait for the engine to start."
  echo ""
  echo "  Then run this script again."
  exit 1
fi
echo "  [OK] Docker Desktop is running"

# 2. Check NAS mount (optional)
echo ""
echo "[2/5] Checking NAS mount..."
if [ -d "/Volumes/NAS/takdi" ]; then
  echo "  [OK] NAS mounted at /Volumes/NAS/takdi"
  NAS_AVAILABLE=true
else
  echo "  [INFO] NAS not mounted at /Volumes/NAS/takdi"
  echo "  Models will be stored in Docker volume (local)"
  NAS_AVAILABLE=false
fi

# 3. Create .env file if not exists
echo ""
echo "[3/5] Checking environment configuration..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  [CREATED] .env file from .env.example"
  echo ""
  echo "  IMPORTANT: Edit .env and set your GEMINI_API_KEY"
  echo "  Open the file: nano .env"
  echo ""
else
  echo "  [OK] .env file exists"
fi

# 4. Create data directories
echo ""
echo "[4/5] Creating data directories..."
mkdir -p data uploads data/comfyui-output
echo "  [OK] data/ uploads/ data/comfyui-output/ created"

# 5. Build and start containers
echo ""
echo "[5/5] Building and starting containers..."
echo "  This may take 10-20 minutes on first run (downloading dependencies)."
echo ""

docker compose build
docker compose up -d

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  Takdi app:  http://localhost:3000"
echo "  ComfyUI:    http://localhost:8188"
echo ""
echo "  NEXT STEP: Download AI models"
echo "  Run: bash scripts/download-models.sh"
echo ""
echo "  To stop:  bash scripts/stop.command"
echo "  To start: bash scripts/start.command"
echo ""

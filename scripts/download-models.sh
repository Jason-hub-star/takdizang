#!/bin/bash
# Download recommended AI models for Takdi ComfyUI
# Usage: bash scripts/download-models.sh
# Requires: running ComfyUI container (docker compose up)
set -euo pipefail

echo "========================================="
echo "  Takdi Model Downloader"
echo "========================================="
echo ""

# Get ComfyUI container name
CONTAINER=$(docker compose ps -q comfyui 2>/dev/null || true)
if [ -z "$CONTAINER" ]; then
  echo "[ERROR] ComfyUI container is not running."
  echo "  Run: docker compose up -d"
  exit 1
fi

echo "Downloading models into ComfyUI container..."
echo "This will take a while depending on your internet speed."
echo ""

# FLUX.1 Dev (FP8 quantized, ~17GB) — main generation model
echo "[1/3] FLUX.1 Dev (FP8, ~17GB)..."
echo "  This is the primary image generation model."
docker compose exec comfyui bash -c '
  cd /comfyui/models/checkpoints &&
  if [ ! -f "flux1-dev-fp8.safetensors" ]; then
    wget -q --show-progress "https://huggingface.co/Comfy-Org/flux1-dev/resolve/main/flux1-dev-fp8.safetensors"
    echo "  [OK] FLUX.1 Dev downloaded"
  else
    echo "  [SKIP] Already exists"
  fi
'

# FLUX.1 Schnell (FP8 quantized, ~12GB) — fast preview model
echo ""
echo "[2/3] FLUX.1 Schnell (FP8, ~12GB)..."
echo "  This is the fast preview model (4-step generation)."
docker compose exec comfyui bash -c '
  cd /comfyui/models/checkpoints &&
  if [ ! -f "flux1-schnell-fp8.safetensors" ]; then
    wget -q --show-progress "https://huggingface.co/Comfy-Org/flux1-schnell/resolve/main/flux1-schnell-fp8.safetensors"
    echo "  [OK] FLUX.1 Schnell downloaded"
  else
    echo "  [SKIP] Already exists"
  fi
'

# BRIA RMBG model for background removal
echo ""
echo "[3/3] BRIA RMBG 2.0 (~0.2GB)..."
echo "  This is the background removal model."
docker compose exec comfyui bash -c '
  cd /comfyui/models &&
  mkdir -p rmbg &&
  cd rmbg &&
  if [ ! -f "RMBG-2.0.pth" ]; then
    wget -q --show-progress "https://huggingface.co/briaai/RMBG-2.0/resolve/main/model.pth" -O RMBG-2.0.pth
    echo "  [OK] BRIA RMBG downloaded"
  else
    echo "  [SKIP] Already exists"
  fi
'

echo ""
echo "========================================="
echo "  Model Download Complete!"
echo "========================================="
echo ""
echo "  Installed models:"
echo "  - FLUX.1 Dev (FP8)     — primary generation"
echo "  - FLUX.1 Schnell (FP8) — fast preview"
echo "  - BRIA RMBG 2.0        — background removal"
echo ""
echo "  Optional: To add Seedream 4.5 later for text rendering,"
echo "  download it manually to the models/checkpoints/ directory."
echo ""

#!/bin/bash
# Takdi 정지 — Finder에서 더블클릭으로 실행 가능
cd "$(dirname "$0")/.."
docker compose down
echo ""
echo "Takdi가 정지되었습니다."
echo ""
echo "이 창은 닫아도 됩니다."
read -p "Enter를 누르면 닫힙니다..."

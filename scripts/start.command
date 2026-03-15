#!/bin/bash
# Takdi 시작 — Finder에서 더블클릭으로 실행 가능
cd "$(dirname "$0")/.."
docker compose up -d
echo ""
echo "Takdi가 시작되었습니다!"
echo "브라우저에서 http://localhost:3000 을 열어주세요."
echo ""
echo "이 창은 닫아도 됩니다."
read -p "Enter를 누르면 닫힙니다..."

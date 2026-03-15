#!/bin/bash
# Takdi backup script — SQLite DB + uploads to NAS
# Usage: bash scripts/backup.sh [backup_dir]
# Default backup dir: ./backups (or /Volumes/NAS/takdi/backups if mounted)

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== Takdi Backup: $DATE ==="

# Create backup directories
mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/uploads"

# Backup SQLite database
if [ -f "./data/takdi.db" ]; then
  cp "./data/takdi.db" "$BACKUP_DIR/db/takdi-$DATE.db"
  echo "[OK] Database backed up: $BACKUP_DIR/db/takdi-$DATE.db"
elif [ -f "./dev.db" ]; then
  cp "./dev.db" "$BACKUP_DIR/db/takdi-$DATE.db"
  echo "[OK] Database backed up: $BACKUP_DIR/db/takdi-$DATE.db"
else
  echo "[SKIP] No database file found"
fi

# Backup uploads
if [ -d "./uploads" ]; then
  tar czf "$BACKUP_DIR/uploads/uploads-$DATE.tar.gz" -C ./uploads .
  echo "[OK] Uploads backed up: $BACKUP_DIR/uploads/uploads-$DATE.tar.gz"
else
  echo "[SKIP] No uploads directory found"
fi

# Clean old backups (keep last 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete 2>/dev/null || true
echo "[OK] Old backups cleaned (30-day retention)"

echo "=== Backup complete ==="

#!/usr/bin/env bash
set -euo pipefail

PI_USER="${PI_USER:-muneeb}"
PI_HOST="${PI_HOST:-10.1.148.191}"
PI_BACKUPS_DIR="${PI_BACKUPS_DIR:-/home/muneeb/dev/cvml-at-the-edge/components/consumer-tracking/backups/}"
LOCAL_BACKUPS_DIR="${LOCAL_BACKUPS_DIR:-backend/data/pi-backups/}"

mkdir -p "$LOCAL_BACKUPS_DIR"

echo "Syncing Pi backups from ${PI_USER}@${PI_HOST}:${PI_BACKUPS_DIR}"
echo "Local mirror: ${LOCAL_BACKUPS_DIR}"

rsync -avz --progress \
  "${PI_USER}@${PI_HOST}:${PI_BACKUPS_DIR}" \
  "$LOCAL_BACKUPS_DIR"

echo "Sync complete."

#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

source setup_env.sh
python detection.py -i rpi -u -f --hef-path yolov8m.hef --labels-json yolov8.json

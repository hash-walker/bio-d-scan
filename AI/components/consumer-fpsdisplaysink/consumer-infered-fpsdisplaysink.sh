#!/usr/bin/env bash

set -euo pipefail

SOCKET_PATH="${SOCKET_PATH:-/tmp/infered.feed}"
RETRY_SECONDS="${RETRY_SECONDS:-30}"

for ((i=1; i<=RETRY_SECONDS; i++)); do
    echo "Connecting to boxed video feed on ${SOCKET_PATH} (${i}/${RETRY_SECONDS})..."

    if gst-launch-1.0 \
        shmsrc socket-path="${SOCKET_PATH}" is-live=true do-timestamp=true ! \
        video/x-raw,format=RGB,width=1920,height=1080,framerate=30/1 ! \
        queue max-size-buffers=2 leaky=downstream ! \
        videoconvert ! \
        fpsdisplaysink video-sink=autovideosink text-overlay=true sync=false; then
        exit 0
    fi

    sleep 1
done

echo "Unable to connect to ${SOCKET_PATH} after ${RETRY_SECONDS} seconds."
echo "If infer.sh is still printing detections, paste its latest output and this script's output together."
exit 1

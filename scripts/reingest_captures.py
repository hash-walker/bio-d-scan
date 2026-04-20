#!/usr/bin/env python3
import os
import json
import base64
import urllib.request
import urllib.error

# Configuration
LOCAL_BACKUPS_DIR = "backend/data/pi-backups"
REMOTE_BACKUPS_PREFIX = "/home/muneeb/dev/cvml-at-the-edge/components/consumer-tracking/backups"
FARMER_ID = "dc7dab14-8fc3-4fa8-84b0-4ddd53859b4d"
API_URL = "http://localhost:4000/api/captures"

def reingest():
    print(f"Starting re-ingestion from {LOCAL_BACKUPS_DIR}...")
    if not os.path.exists(LOCAL_BACKUPS_DIR):
        print(f"Directory {LOCAL_BACKUPS_DIR} not found.")
        return

    runs = os.listdir(LOCAL_BACKUPS_DIR)
    total_processed = 0
    total_success = 0

    for run_dir in sorted(runs):
        run_path = os.path.join(LOCAL_BACKUPS_DIR, run_dir)
        if not os.path.isdir(run_path):
            continue

        jsonl_path = os.path.join(run_path, "detections.jsonl")
        if not os.path.exists(jsonl_path):
            continue

        print(f"Processing run: {run_dir}")
        with open(jsonl_path, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    tracking_id = entry.get("tracking_id")
                    
                    payload = {
                        "tracking_id": tracking_id,
                        "label": entry.get("label"),
                        "confidence": entry.get("confidence"),
                        "timestamp": entry.get("best_seen_at") or entry.get("first_seen_at"),
                        "bbox_xyxy": entry.get("bbox"),
                        "backup_run_id": entry.get("backup_run_id") or run_dir,
                        "farmer_id": FARMER_ID
                    }
                    
                    # Resolve local image path
                    remote_img_path = entry.get("image_path")
                    if remote_img_path:
                        # e.g. /home/muneeb/.../backups/RUN/images/tracking_ID.jpg
                        # we want LOCAL_BACKUPS_DIR/RUN/images/tracking_ID.jpg
                        rel_path = remote_img_path.replace(REMOTE_BACKUPS_PREFIX, "").lstrip("/")
                        local_img_path = os.path.join(LOCAL_BACKUPS_DIR, rel_path)
                        
                        if os.path.exists(local_img_path):
                            with open(local_img_path, "rb") as img_file:
                                payload["image_b64"] = base64.b64encode(img_file.read()).decode("utf-8")
                        else:
                            # Try searching in the current run dir
                            alt_path = os.path.join(run_path, "images", f"tracking_{tracking_id}.jpg")
                            if os.path.exists(alt_path):
                                with open(alt_path, "rb") as img_file:
                                    payload["image_b64"] = base64.b64encode(img_file.read()).decode("utf-8")

                    total_processed += 1
                    # Post to API
                    body = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(
                        API_URL, 
                        data=body, 
                        headers={"Content-Type": "application/json"}, 
                        method="POST"
                    )
                    try:
                        with urllib.request.urlopen(req, timeout=15) as resp:
                            if resp.getcode() in [200, 201]:
                                total_success += 1
                    except Exception as e:
                        print(f"  Error tracking_id {tracking_id}: {e}")
                except Exception as e:
                    print(f"  Unexpected error: {e}")

    print(f"Completed. Processed: {total_processed}, Success: {total_success}")

if __name__ == "__main__":
    reingest()

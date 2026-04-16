import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gst
import json
import os
from datetime import datetime

import boto3
import cv2
import hailo
import numpy as np

from hailo_rpi_common import (
    app_callback_class,
    get_caps_from_pad,
    get_numpy_from_buffer,
)
from detection_pipeline import GStreamerDetectionApp


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
RUN_ID = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_ROOT = os.getenv(
    "DETECTION_BACKUP_DIR",
    os.path.join(CURRENT_DIR, "backups", RUN_ID),
)
IMAGES_DIR = os.path.join(BACKUP_ROOT, "images")
METADATA_DIR = os.path.join(BACKUP_ROOT, "metadata")
SUMMARY_LOG = os.path.join(BACKUP_ROOT, "detections.jsonl")

MQTT_TOPIC = os.getenv("AWS_IOT_TOPIC", "detections")
S3_BUCKET = os.getenv("AWS_S3_BUCKET")
S3_PREFIX = os.getenv("AWS_S3_PREFIX", "detections")
MIN_DETECTION_CONFIDENCE = float(os.getenv("MIN_DETECTION_CONFIDENCE", "0.70"))

BEST_DETECTIONS = {}
EMITTED_IDS = set()


def ensure_backup_dirs():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(METADATA_DIR, exist_ok=True)


def timestamp_now():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def image_path_for(tracking_id):
    return os.path.join(IMAGES_DIR, f"tracking_{tracking_id}.jpg")


def metadata_path_for(tracking_id):
    return os.path.join(METADATA_DIR, f"tracking_{tracking_id}.txt")


def clamp(value, lower, upper):
    return max(lower, min(value, upper))


def convert_frame_to_bgr(frame, fmt):
    if frame is None:
        return None

    if fmt == "RGB" and isinstance(frame, np.ndarray):
        return cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    if fmt == "BGR" and isinstance(frame, np.ndarray):
        return frame.copy()

    if fmt == "NV12" and isinstance(frame, tuple) and len(frame) == 2:
        y_plane, uv_plane = frame
        nv12 = np.vstack((y_plane, uv_plane.reshape(-1, y_plane.shape[1])))
        return cv2.cvtColor(nv12, cv2.COLOR_YUV2BGR_NV12)

    return None


def extract_annotated_crop(frame_bgr, bbox, label, confidence, tracking_id, timestamp):
    frame_height, frame_width = frame_bgr.shape[:2]
    x1, y1, x2, y2 = bbox

    box_width = max(1, x2 - x1)
    box_height = max(1, y2 - y1)
    margin_x = max(20, int(box_width * 0.2))
    margin_y = max(20, int(box_height * 0.2))

    crop_x1 = clamp(x1 - margin_x, 0, frame_width - 1)
    crop_y1 = clamp(y1 - margin_y, 0, frame_height - 1)
    crop_x2 = clamp(x2 + margin_x, crop_x1 + 1, frame_width)
    crop_y2 = clamp(y2 + margin_y, crop_y1 + 1, frame_height)

    crop = frame_bgr[crop_y1:crop_y2, crop_x1:crop_x2].copy()

    rel_x1 = x1 - crop_x1
    rel_y1 = y1 - crop_y1
    rel_x2 = x2 - crop_x1
    rel_y2 = y2 - crop_y1

    cv2.rectangle(crop, (rel_x1, rel_y1), (rel_x2, rel_y2), (0, 255, 0), 3)
    overlay_text = f"ID {tracking_id} {label} {confidence:.2f}"
    timestamp_text = timestamp.replace("T", " ")
    cv2.putText(crop, overlay_text, (12, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(crop, timestamp_text, (12, 64), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)

    return crop


def append_summary(entry):
    with open(SUMMARY_LOG, "a", encoding="utf-8") as summary_file:
        summary_file.write(json.dumps(entry) + "\n")


def write_metadata_file(entry):
    metadata_path = metadata_path_for(entry["tracking_id"])
    lines = [
        f"tracking_id: {entry['tracking_id']}",
        f"label: {entry['label']}",
        f"confidence: {entry['confidence']:.4f}",
        f"first_seen_at: {entry['first_seen_at']}",
        f"best_seen_at: {entry['best_seen_at']}",
        f"image_path: {entry['image_path']}",
        f"bbox_xyxy: {entry['bbox']}",
        f"frame_size: {entry['frame_size'][0]}x{entry['frame_size'][1]}",
        f"backup_run_id: {RUN_ID}",
    ]
    if "image_s3_uri" in entry:
        lines.append(f"image_s3_uri: {entry['image_s3_uri']}")

    with open(metadata_path, "w", encoding="utf-8") as metadata_file:
        metadata_file.write("\n".join(lines) + "\n")


def maybe_save_best_detection(tracking_id, label, confidence, bbox, frame_bgr, timestamp, frame_size):
    previous = BEST_DETECTIONS.get(tracking_id)
    if previous and confidence <= previous["confidence"]:
        return previous

    image_path = image_path_for(tracking_id)
    annotated_crop = extract_annotated_crop(frame_bgr, bbox, label, confidence, tracking_id, timestamp)
    cv2.imwrite(image_path, annotated_crop)

    first_seen_at = previous["first_seen_at"] if previous else timestamp
    entry = {
        "tracking_id": tracking_id,
        "label": label,
        "confidence": float(confidence),
        "first_seen_at": first_seen_at,
        "best_seen_at": timestamp,
        "image_path": image_path,
        "bbox": bbox,
        "frame_size": frame_size,
        "backup_run_id": RUN_ID,
    }
    s3_uri = maybe_upload_snapshot_to_s3(image_path, tracking_id)
    if s3_uri:
        entry["image_s3_uri"] = s3_uri
    BEST_DETECTIONS[tracking_id] = entry
    write_metadata_file(entry)
    append_summary(entry)
    return entry


def maybe_upload_snapshot_to_s3(image_path, tracking_id):
    if not S3_CLIENT or not S3_BUCKET:
        return None

    object_key = f"{S3_PREFIX.rstrip('/')}/{RUN_ID}/tracking_{tracking_id}.jpg"
    try:
        S3_CLIENT.upload_file(image_path, S3_BUCKET, object_key)
        return f"s3://{S3_BUCKET}/{object_key}"
    except Exception as exc:
        print(f"Warning: failed to upload snapshot for tracking ID {tracking_id} to S3: {exc}")
        return None


def build_clients():
    access_key = os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    iot_endpoint = os.getenv("AWS_IOT_DATA_ENDPOINT")

    session_kwargs = {}
    if region:
        session_kwargs["region_name"] = region
    if access_key and secret_key:
        session_kwargs["aws_access_key_id"] = access_key
        session_kwargs["aws_secret_access_key"] = secret_key
    if session_token:
        session_kwargs["aws_session_token"] = session_token

    if not region:
        print("Warning: AWS region not set. Cloud publishing is disabled.")
        return None, None

    try:
        session = boto3.Session(**session_kwargs)
        client_kwargs = {}
        if iot_endpoint:
            client_kwargs["endpoint_url"] = iot_endpoint if iot_endpoint.startswith("https://") else f"https://{iot_endpoint}"
        else:
            print("Warning: AWS_IOT_DATA_ENDPOINT not set. boto3 will use its default endpoint resolution.")
        iot_client = session.client("iot-data", **client_kwargs)
        s3_client = session.client("s3")
        print("AWS clients initialized successfully")
        return iot_client, s3_client
    except Exception as exc:
        print(f"Warning: Failed to initialize AWS client: {exc}")
        print("Detections will be printed and backed up locally, but not sent to AWS")
        return None, None


CLIENT, S3_CLIENT = build_clients()


class user_app_callback_class(app_callback_class):
    def __init__(self):
        super().__init__()
        self.backup_root = BACKUP_ROOT


def app_callback(pad, info, user_data):
    buffer = info.get_buffer()
    if buffer is None:
        return Gst.PadProbeReturn.OK

    user_data.increment()
    fmt, width, height = get_caps_from_pad(pad)

    frame = None
    frame_bgr = None
    if user_data.use_frame and fmt and width and height:
        frame = get_numpy_from_buffer(buffer, fmt, width, height)
        frame_bgr = convert_frame_to_bgr(frame, fmt)

    roi = hailo.get_roi_from_buffer(buffer)
    hailo_detections = roi.get_objects_typed(hailo.HAILO_DETECTION)
    filtered_detections = [
        detection for detection in hailo_detections
        if float(detection.get_confidence()) >= MIN_DETECTION_CONFIDENCE
    ]

    for detection in filtered_detections:
        unique_ids = detection.get_objects_typed(hailo.HAILO_UNIQUE_ID)
        if not unique_ids:
            continue

        tracking_id = unique_ids[0].get_id()
        label = detection.get_label()
        confidence = float(detection.get_confidence())
        bbox = detection.get_bbox()
        bbox_xyxy = [
            int(bbox.xmin() * width),
            int(bbox.ymin() * height),
            int(bbox.xmax() * width),
            int(bbox.ymax() * height),
        ]
        timestamp = timestamp_now()

        saved_entry = None
        if frame_bgr is not None:
            saved_entry = maybe_save_best_detection(
                tracking_id=tracking_id,
                label=label,
                confidence=confidence,
                bbox=bbox_xyxy,
                frame_bgr=frame_bgr,
                timestamp=timestamp,
                frame_size=(width, height),
            )

        if tracking_id not in EMITTED_IDS:
            print(f"Detection!: {tracking_id} {label} {confidence:.2f}")
            EMITTED_IDS.add(tracking_id)

            payload = {
                "tracking_id": tracking_id,
                "label": label,
                "confidence": confidence,
                "timestamp": timestamp,
                "bbox_xyxy": bbox_xyxy,
                "backup_run_id": RUN_ID,
            }
            if saved_entry:
                payload["image_path"] = saved_entry["image_path"]
                if "image_s3_uri" in saved_entry:
                    payload["image_s3_uri"] = saved_entry["image_s3_uri"]

            if CLIENT:
                try:
                    response = CLIENT.publish(topic=MQTT_TOPIC, qos=1, payload=json.dumps(payload))
                    print(f"Message published: {response}")
                except Exception as exc:
                    print(f"Warning: failed to publish detection {tracking_id} to AWS IoT: {exc}")
            else:
                print(f"AWS client not available. Would have published: {json.dumps(payload)}")

    return Gst.PadProbeReturn.OK


if __name__ == "__main__":
    ensure_backup_dirs()
    print(f"Saving local detection backups to: {BACKUP_ROOT}")
    user_data = user_app_callback_class()
    app = GStreamerDetectionApp(app_callback, user_data)
    app.run()

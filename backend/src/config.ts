import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optional("PORT", "4000"), 10),
  frontendUrl: optional("FRONTEND_URL", "http://localhost:3000"),

  db: {
    postgres: optional("DATABASE_URL", ""),
    mongo: optional("MONGODB_URI", "mongodb://localhost:27017/bioscan"),
  },

  aws: {
    region: optional("AWS_REGION", "us-east-1"),
    iotEndpoint: optional("AWS_IOT_ENDPOINT", ""),
    iotCertPath: optional("AWS_IOT_CERT_PATH", ""),
    iotKeyPath: optional("AWS_IOT_KEY_PATH", ""),
    iotCaPath: optional("AWS_IOT_CA_PATH", ""),
    iotTopic: optional("AWS_IOT_TOPIC", "detections"),
    accessKeyId: optional("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: optional("AWS_SECRET_ACCESS_KEY", ""),
    s3Bucket: optional("AWS_S3_BUCKET", ""),
    s3Prefix: optional("AWS_S3_PREFIX", "detections"),
  },

  liveStreamUrl: optional("LIVE_STREAM_URL", ""),
  jwtSecret: optional("JWT_SECRET", "bioscan-dev-secret-change-in-production"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),

  piSync: {
    enabled: optional("PI_SYNC_ENABLED", "false") === "true",
    host: optional("PI_SYNC_HOST", ""),
    port: parseInt(optional("PI_SYNC_PORT", "22"), 10),
    username: optional("PI_SYNC_USERNAME", ""),
    password: optional("PI_SYNC_PASSWORD", ""),
    remoteDir: optional("PI_SYNC_REMOTE_DIR", ""),
    localDir: optional("BACKUP_CAPTURES_DIR", path.resolve(process.cwd(), "data", "pi-backups")),
    intervalMs: parseInt(optional("PI_SYNC_INTERVAL_MS", "60000"), 10),
  },
} as const;

# AWS Setup

## Local backup on the Pi

`infer.sh` now saves one best snapshot per tracking ID and a matching metadata text file for any detected class whose confidence is at least `MIN_DETECTION_CONFIDENCE`.

By default, each run writes to:

`components/consumer-tracking/backups/<run_id>/`

Inside that folder:

- `images/tracking_<id>.jpg`
- `metadata/tracking_<id>.txt`
- `detections.jsonl`

The image is updated only when the same tracking ID is seen again with a higher confidence score.

## Configure AWS credentials on the Pi

You can use either:

1. `aws configure`
2. environment variables

This app supports the standard AWS SDK variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional)
- `AWS_REGION` or `AWS_DEFAULT_REGION`

It also uses:

- `AWS_IOT_DATA_ENDPOINT`
- `AWS_IOT_TOPIC` (optional, defaults to `detections`)
- `AWS_S3_BUCKET` (optional, uploads best snapshots)
- `AWS_S3_PREFIX` (optional, defaults to `detections`)

Example:

```bash
cd /home/muneeb/dev/cvml-at-the-edge/components/consumer-tracking
source aws-env.example
```

Then replace the placeholder values with your real ones.

## Find your AWS IoT data endpoint

Use:

```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region us-east-1
```

Take the returned `endpointAddress` and set it as `AWS_IOT_DATA_ENDPOINT`.

## Recommended cloud path

For a simple analytics setup:

1. Pi publishes detection metadata to AWS IoT Core.
2. Best snapshots can be uploaded directly to S3 from the Pi.
3. AWS IoT Rule writes metadata into DynamoDB.
4. Build a dashboard in QuickSight from Athena/S3 or another analytics store.

If `AWS_S3_BUCKET` is not set, images stay on the Pi only. If it is set, the best snapshot for each tracking ID is also uploaded to S3.

## Run with AWS enabled

```bash
cd /home/muneeb/dev/cvml-at-the-edge/components/consumer-tracking
source aws-env.example
./infer.sh
```

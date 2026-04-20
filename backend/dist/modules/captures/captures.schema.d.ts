import { z } from "zod";
export declare const MqttCaptureSchema: z.ZodObject<{
    tracking_id: z.ZodNumber;
    label: z.ZodString;
    confidence: z.ZodNumber;
    timestamp: z.ZodString;
    bbox_xyxy: z.ZodArray<z.ZodNumber, "many">;
    backup_run_id: z.ZodOptional<z.ZodString>;
    image_path: z.ZodOptional<z.ZodString>;
    image_s3_uri: z.ZodOptional<z.ZodString>;
    farmer_id: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    trajectory: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label: string;
    confidence: number;
    timestamp: string;
    tracking_id: number;
    bbox_xyxy: number[];
    lat?: number | undefined;
    lng?: number | undefined;
    farmer_id?: string | undefined;
    trajectory?: string | undefined;
    backup_run_id?: string | undefined;
    image_path?: string | undefined;
    image_s3_uri?: string | undefined;
}, {
    label: string;
    confidence: number;
    timestamp: string;
    tracking_id: number;
    bbox_xyxy: number[];
    lat?: number | undefined;
    lng?: number | undefined;
    farmer_id?: string | undefined;
    trajectory?: string | undefined;
    backup_run_id?: string | undefined;
    image_path?: string | undefined;
    image_s3_uri?: string | undefined;
}>;
export type MqttCaptureInput = z.infer<typeof MqttCaptureSchema>;
export declare function labelToKind(label: string): string;
export interface Capture {
    id: string;
    trackingId: number;
    farmerId: string | null;
    label: string;
    kind: string;
    confidence: number;
    timestamp: string;
    bboxXyxy: number[];
    imageS3Uri: string | null;
    imagePath: string | null;
    lat: number | null;
    lng: number | null;
    trajectory: string | null;
}

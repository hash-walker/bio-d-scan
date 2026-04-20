interface RawBackupDetection {
    tracking_id: number;
    label: string;
    confidence: number;
    first_seen_at: string;
    best_seen_at: string;
    image_path?: string;
    bbox?: number[];
    frame_size?: number[];
    backup_run_id?: string;
}
export interface BackupRunSummary {
    id: string;
    startedAt: string | null;
    latestSeenAt: string | null;
    detectionCount: number;
    imageCount: number;
    metadataCount: number;
}
export interface BackupCapture {
    id: string;
    runId: string;
    trackingId: number;
    label: string;
    kind: string;
    confidence: number;
    firstSeenAt: string;
    bestSeenAt: string;
    timestamp: string;
    imageUrl: string | null;
    imagePath: string | null;
    bboxXyxy: number[];
    frameSize: number[] | null;
    raw: RawBackupDetection;
}
export interface BackupRunsResponse {
    runs: BackupRunSummary[];
    nextOffset: number | null;
    rootDir: string;
}
export interface BackupCapturesResponse {
    run: BackupRunSummary;
    captures: BackupCapture[];
    nextOffset: number | null;
}
export interface AllBackupCapturesResponse {
    captures: BackupCapture[];
    nextOffset: number | null;
    total: number;
}
export declare const captureBackupsService: {
    rootDir: string;
    listRuns(limit?: number, offset?: number): Promise<BackupRunsResponse>;
    getRunCaptures(runId: string, limit?: number, offset?: number): Promise<BackupCapturesResponse>;
    listCaptures(limit?: number, offset?: number): Promise<AllBackupCapturesResponse>;
};
export {};

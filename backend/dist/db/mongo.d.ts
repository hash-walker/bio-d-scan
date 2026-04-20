import mongoose from "mongoose";
export declare const CaptureModel: mongoose.Model<{
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    collection: string;
}> & {
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & mongoose.FlatRecord<{
    trackingId: number;
    label: string;
    confidence: number;
    bboxXyxy: number[];
    timestamp: NativeDate;
    lat?: number | null | undefined;
    lng?: number | null | undefined;
    farmerId?: string | null | undefined;
    imageS3Uri?: string | null | undefined;
    imagePath?: string | null | undefined;
    backupRunId?: string | null | undefined;
    kind?: string | null | undefined;
    trajectory?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export declare function connectMongo(): Promise<void>;

import { type MqttCaptureInput, type Capture } from "./captures.schema";
export declare const capturesService: {
    /** Called by the MQTT bridge for every new detection from the Pi. */
    ingest(payload: MqttCaptureInput): Promise<Capture>;
    getAll(filters: {
        farmerId?: string;
        kind?: string;
        limit?: number;
    }): Promise<Capture[]>;
    getById(id: string): Promise<Capture | null>;
    getStats(): Promise<Record<string, number>>;
};

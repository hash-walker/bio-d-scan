export declare const config: {
    readonly port: number;
    readonly frontendUrl: string;
    readonly db: {
        readonly postgres: string;
        readonly mongo: string;
    };
    readonly aws: {
        readonly region: string;
        readonly iotEndpoint: string;
        readonly iotCertPath: string;
        readonly iotKeyPath: string;
        readonly iotCaPath: string;
        readonly iotTopic: string;
        readonly accessKeyId: string;
        readonly secretAccessKey: string;
        readonly s3Bucket: string;
        readonly s3Prefix: string;
    };
    readonly liveStreamUrl: string;
    readonly jwtSecret: string;
    readonly jwtExpiresIn: string;
    readonly piSync: {
        readonly enabled: boolean;
        readonly host: string;
        readonly port: number;
        readonly username: string;
        readonly password: string;
        readonly remoteDir: string;
        readonly localDir: string;
        readonly intervalMs: number;
    };
};

declare const _default: (() => {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
    corsOrigins: string[];
    throttle: {
        ttl: number;
        limit: number;
    };
    loginThrottle: {
        ttl: number;
        limit: number;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    firebase: {
        projectId: string;
        privateKey: string;
        clientEmail: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    ceo: {
        email: string;
        defaultPassword: string;
        firstName: string;
        lastName: string;
    };
    twoFactor: {
        appName: string;
        otpExpirySeconds: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    apiPrefix: string;
    corsOrigins: string[];
    throttle: {
        ttl: number;
        limit: number;
    };
    loginThrottle: {
        ttl: number;
        limit: number;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    firebase: {
        projectId: string;
        privateKey: string;
        clientEmail: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    ceo: {
        email: string;
        defaultPassword: string;
        firstName: string;
        lastName: string;
    };
    twoFactor: {
        appName: string;
        otpExpirySeconds: number;
    };
}>;
export default _default;

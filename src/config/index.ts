import pkg from "../../package.json";

export const APP_VERSION = pkg.version;
export const LAST_UPDATED = "2025-12-22";

export interface Env {
    API_SECRET_KEY: string;
    GOOGLE_SAFE_BROWSING_API_KEY: string;
    AI: any;
}


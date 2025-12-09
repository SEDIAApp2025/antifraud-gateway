/**
 * Antifraud Gateway - Student Project
 * * 功能：
 * 1. API Gateway 身份驗證 (x-api-key)
 * 2. 詐騙網址檢測 (/check-fraud)
 * 3. CSV 資料轉 JSON (/data)
 * 4. 版本檢查 (/version)
 */


export interface Env {
    API_SECRET_KEY: string;
}

const APP_VERSION = "1.0.1";
const LAST_UPDATED = "2025-12-09";

interface StandardResponse {
    success: boolean;
    version: string;
    data?: any;
    error?: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const API_PREFIX = "/api";

        // --- A. CORS 設定 ---
        // 允許 Android Studio 或瀏覽器跨網域存取
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key", 
        };

        // 處理預檢請求 (Preflight)
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // --- B. Security Check ---
        // Get the API key from the request header
        const clientKey = request.headers.get("x-api-key");
        // Get the valid API key from environment variables (reads from .dev.vars in local development)
        const validKey = env.API_SECRET_KEY;

        // Whitelist paths (no authentication required)
        const isPublicPath = pathname === "/" || pathname === `${API_PREFIX}/version`;

        // Authentication failure conditions: path is not public AND (no key or key is invalid)
        if (!isPublicPath && (!clientKey || clientKey !== validKey)) {
            return new Response(JSON.stringify({
                success: false,
                version: APP_VERSION,
                error: "Unauthorized: Invalid or missing 'x-api-key'"
            }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // --- C. Routing ---

        // 1. Version Check API
        if (pathname === `${API_PREFIX}/version`) {
            return successResponse({
                app_name: "Antifraud Gateway",
                version: APP_VERSION,
                updated_at: LAST_UPDATED,
                author: "lychen"
            }, corsHeaders);
        }

        // 2. Fraud Detection API
        // Usage: /check-fraud?url=http://example.com
        if (pathname === `${API_PREFIX}/check-fraud`) {
            const targetUrl = url.searchParams.get("url");

            if (!targetUrl) {
                return errorResponse("Missing 'url' query parameter", corsHeaders);
            }

            // Simulated detection logic (can be replaced with real API later)
            // If the URL contains scam, fraud, or bad, it is considered fraudulent
            const isScam = targetUrl.includes("scam") || targetUrl.includes("fraud") || targetUrl.includes("bad");

            const result = {
                input_url: targetUrl,
                is_safe: !isScam,
                risk_level: isScam ? "HIGH" : "LOW",
                message: isScam ? "Warning: Potential risk detected" : "Safe: No anomalies found",
                detection_time: new Date().toISOString()
            };

            return successResponse(result, corsHeaders);
        }

        // 3. CSV Data API
        // Usage: /data
        if (pathname === `${API_PREFIX}/data`) {
            // Place your CSV data here (simulated)
            // Note: For large data, consider fetching from GitHub Raw URL
            const csvContent = `id,source_number,category,description
            1,0912345678,Fraud,Impersonating Health Insurance Bureau scam
            2,0988777666,Spam,Bank loan promotion
            3,0223456789,Safe,Some public agency switchboard
            4,0911222333,Fraud,Installment payment cancellation scam`;

            const jsonData = csvToJson(csvContent);
            return successResponse(jsonData, corsHeaders);
        }

        // 4. Default Response (404)
        return errorResponse(`Route not found. Try ${API_PREFIX}/version`, corsHeaders, 404);
    },
};

// --- D. Helper Functions ---

/**
 * Unified success response format
 */
function successResponse(data: any, headers: any): Response {
    const body: StandardResponse = {
        success: true,
        version: APP_VERSION,
        data: data
    };
    return new Response(JSON.stringify(body), {
        headers: { ...headers, "Content-Type": "application/json" }
    });
}

/**
 * Unified error response format
 */
function errorResponse(message: string, headers: any, status: number = 400): Response {
    const body: StandardResponse = {
        success: false,
        version: APP_VERSION,
        error: message
    };
    return new Response(JSON.stringify(body), {
        status: status,
        headers: { ...headers, "Content-Type": "application/json" }
    });
}

/**
 * Convert CSV string to JSON object array
 */
function csvToJson(csv: string): any[] {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return []; // Only header or empty string
    
    // Process header (trim whitespace)
    const headers = lines[0].split(",").map(h => h.trim());

    // Process each line
    return lines.slice(1).map(line => {
        const values = line.split(",");
        let obj: any = {};

        headers.forEach((header, index) => {
            // Safe access to avoid undefined
            const val = values[index];
            obj[header] = val ? val.trim() : "";
        });

        return obj;
    });
}
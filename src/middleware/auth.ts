import { Env } from "../config";
import { errorResponse, corsHeaders } from "../utils/response";

export async function authMiddleware(request: Request, env: Env): Promise<Response | void> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const API_PREFIX = "/api";

    // Whitelist paths
    const isPublicPath = 
        pathname === "/" || 
        pathname === `${API_PREFIX}/version` ||
        pathname === `${API_PREFIX}/docs` ||
        pathname === `${API_PREFIX}/openapi.json`;

    if (isPublicPath) {
        return; // Proceed
    }

    const clientKey = request.headers.get("x-api-key");
    const validKey = env.API_SECRET_KEY;

    if (!clientKey || clientKey !== validKey) {
        return errorResponse("Unauthorized: Invalid or missing 'x-api-key'", 401);
    }
}

import { APP_VERSION } from "../config";
import { StandardResponse } from "../types";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export function successResponse<T>(data: T, headers: HeadersInit = corsHeaders): Response {
    const responseBody: StandardResponse<T> = {
        success: true,
        version: APP_VERSION,
        data: data,
    };
    return new Response(JSON.stringify(responseBody), {
        headers: { ...headers, "Content-Type": "application/json" },
    });
}

export function errorResponse(message: string, status: number = 400, headers: HeadersInit = corsHeaders): Response {
    const responseBody: StandardResponse<null> = {
        success: false,
        version: APP_VERSION,
        error: message,
    };
    return new Response(JSON.stringify(responseBody), {
        status: status,
        headers: { ...headers, "Content-Type": "application/json" },
    });
}

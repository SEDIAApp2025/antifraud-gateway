import { OpenAPIRoute, Str, Query } from "@cloudflare/itty-router-openapi";
import { checkUrlSafety } from "../services/googleSafeBrowsing";
import { Env } from "../config";
import { RiskLevel } from "../types";
import { successResponse, errorResponse } from "../utils/response";

export class UrlCheck extends OpenAPIRoute {
  static schema = {
    tags: ["URL Check"],
    summary: "Check if a URL is safe",
    description: "Checks the given URL against Google Safe Browsing API.",
    parameters: {
      url: Query(Str, { description: "The URL to check", required: true }),
    },
    responses: {
      "200": {
        description: "URL safety check result",
        schema: {
          success: Boolean,
          version: String,
          data: {
            url: String,
            riskLevel: Str,
            threatType: Str,
            description: Str,
          },
        },
      },
      "400": {
        description: "Bad Request",
        schema: {
            success: Boolean,
            version: String,
            error: String
        }
      }
    },
  };

  async handle(request: Request, env: Env, ctx: any, data: Record<string, any>) {
    const { url } = data.query;

    try {
      const apiKey = env.GOOGLE_SAFE_BROWSING_API_KEY;
      const safetyResult = await checkUrlSafety(url, apiKey);
      const isSafe = safetyResult.isSafe;
      const riskLevel = isSafe ? RiskLevel.LOW : RiskLevel.HIGH;

      return successResponse({
        url: url,
        riskLevel: riskLevel,
        threatType: safetyResult.threatType || null,
        description: isSafe ? "Safe" : `Detected ${safetyResult.threatType}`,
      });
    } catch (error: any) {
      return errorResponse(`URL check failed: ${error.message}`, 500);
    }
  }
}

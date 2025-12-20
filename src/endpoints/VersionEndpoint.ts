import { OpenAPIRoute, Str } from "@cloudflare/itty-router-openapi";
import { APP_VERSION, LAST_UPDATED } from "../config";
import { successResponse } from "../utils/response";

export class GetVersion extends OpenAPIRoute {
  static schema = {
    tags: ["System"],
    summary: "Get API Version",
    responses: {
      "200": {
        description: "Version information",
        schema: {
          success: Boolean,
          version: String,
          data: {
            appName: String,
            version: String,
            updatedAt: String,
            author: String,
          },
        },
      },
    },
  };

  async handle(request: Request, env: any, ctx: any) {
    return successResponse({
      appName: "Antifraud Gateway",
      version: APP_VERSION,
      updatedAt: LAST_UPDATED,
      author: "lychen",
    });
  }
}

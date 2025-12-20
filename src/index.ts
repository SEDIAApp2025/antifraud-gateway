import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { APP_VERSION } from "./config";
import { authMiddleware } from "./middleware/auth";
import { GetVersion } from "./endpoints/VersionEndpoint";
import { UrlCheck } from "./endpoints/UrlCheckEndpoint";
import { GetCellphone } from "./endpoints/CellphoneEndpoint";
import { AiCheck } from "./endpoints/AiCheckEndpoint";
import { corsHeaders } from "./utils/response";
import { Env } from "./config";

export const router = OpenAPIRouter({
  docs_url: "/api/docs",
  schema: {
    info: {
      title: "Antifraud Gateway API",
      description: "API Gateway for fraud detection and cellphone data retrieval.",
      version: APP_VERSION,
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
});

router.registry.registerComponent("securitySchemes", "ApiKeyAuth", {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
});

// Middleware
router.all("/api/*", authMiddleware);

// Routes
router.get("/api/version", GetVersion);
router.get("/api/url-check", UrlCheck);
router.get("/api/cellphone", GetCellphone);
router.post("/api/ai-check", AiCheck);

// 404
router.all("*", () => new Response(JSON.stringify({ success: false, error: "Not Found" }), { status: 404 }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      // Handle CORS Preflight
      if (request.method === "OPTIONS") {
          return new Response(null, { headers: corsHeaders });
      }

      // Handle Request
      const response = await router.handle(request, env, ctx);

      // Add CORS headers to response
      const newResponse = new Response(response.body, response);
      Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
      });
      
      return newResponse;
  }
};



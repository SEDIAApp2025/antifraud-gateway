import { OpenAPIRoute, Str } from "@cloudflare/itty-router-openapi";
import { RiskLevel } from "../types";
import { successResponse, errorResponse } from "../utils/response";

const MAX_CONTENT_LENGTH = 200;

export class AiCheck extends OpenAPIRoute {
  static schema = {
    tags: ["AI Check"],
    summary: "AI Fraud Check",
    requestBody: {
        description: `Raw text content to analyze (Max ${MAX_CONTENT_LENGTH} characters)`,
        content: {
            "text/plain": {
                schema: {
                    type: "string",
                    maxLength: MAX_CONTENT_LENGTH,
                    example: "恭喜您中獎了，請點擊連結領取"
                }
            }
        }
    },
    responses: {
      "200": {
        description: "AI analysis result",
        schema: {
          success: Boolean,
          version: String,
          data: {
            riskLevel: Str,
            description: Str,
            suggestion: Str
          },
        },
      },
    },
  };

  async handle(request: Request, env: any, ctx: any, data: Record<string, any>) {
    const content = data.body;

    if (!content || typeof content !== 'string') {
        return errorResponse("Content is required and must be text/plain", 400);
    }

    if (content.length > MAX_CONTENT_LENGTH) {
        return errorResponse(`Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters`, 400);
    }

    try {
        const messages = [
            { 
                role: "system", 
                content: `You are an expert fraud detection system. Analyze the user's text message for potential fraud, phishing, or scam attempts. 
                Respond ONLY with a valid JSON object (no markdown, no plain text explanations outside JSON) containing the following fields:
                - "riskLevel": One of "HIGH", "MEDIUM", "LOW".
                - "description": A brief explanation of the risk in Traditional Chinese (繁體中文).
                - "suggestion": Advice for the user in Traditional Chinese (繁體中文).` 
            },
            { role: "user", content: content }
        ];

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages,
        });
        
        let aiResult;
        try {
            // Clean up potential markdown code blocks if the model adds them
            const rawResponse = (response as any).response.replace(/```json/g, "").replace(/```/g, "").trim();
            aiResult = JSON.parse(rawResponse);
        } catch (e) {
            console.error("AI JSON Parse Error:", e, (response as any).response);
            aiResult = {
                riskLevel: RiskLevel.UNKNOWN,
                description: "AI 回應格式錯誤",
                suggestion: "請自行判斷訊息真偽",
                raw: (response as any).response
            };
        }

        return successResponse({
            riskLevel: aiResult.riskLevel || RiskLevel.UNKNOWN,
            description: aiResult.description || aiResult.reason || "Analysis complete",
            suggestion: aiResult.suggestion || "No suggestion provided"
        });

    } catch (error: any) {
        return errorResponse(`AI check failed: ${error.message}`, 500);
    }
  }
}

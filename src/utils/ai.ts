import { RiskLevel } from "../types";

export interface AiAnalysisResult {
    riskLevel: string;
    description: string;
    suggestion: string;
    raw?: string;
}

export function parseAiResponse(response: any): AiAnalysisResult {
    let aiResult: AiAnalysisResult;
    const rawContent = response.response || "";

    try {
        // Clean up potential markdown code blocks if the model adds them
        let rawResponse = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Attempt to fix truncated JSON (common with LLMs)
        if (rawResponse && !rawResponse.endsWith("}")) {
            rawResponse += "}";
        }

        aiResult = JSON.parse(rawResponse);
    } catch (e) {
        console.error("AI JSON Parse Error:", e, rawContent);
        aiResult = {
            riskLevel: RiskLevel.UNKNOWN,
            description: "AI 回應格式錯誤",
            suggestion: "請自行判斷訊息真偽",
            raw: rawContent
        };
    }

    return aiResult;
}

import { OpenAPIRoute, Str, Query } from "@cloudflare/itty-router-openapi";
import { getCellphoneData, getCellphoneByNumber } from "../services/csvService";
import { successResponse, errorResponse } from "../utils/response";
import { RiskLevel } from "../types";

export class GetCellphone extends OpenAPIRoute {
  static schema = {
    tags: ["Cellphone Data"],
    summary: "Get cellphone data",
    description: "Retrieve all cellphone records or search by phone number.",
    parameters: {
      phoneNumber: Query(Str, { description: "Filter by specific phone number", required: false }),
    },
    responses: {
      "200": {
        description: "Cellphone data retrieved successfully",
        schema: {
          success: Boolean,
          version: String,
          data: {}, // Object, Array, or Default Object if not found
        },
      },
    },
  };

  async handle(request: Request, env: any, ctx: any, data: Record<string, any>) {
    const { phoneNumber } = data.query;

    if (phoneNumber) {
        const record = getCellphoneByNumber(phoneNumber);
        if (!record) {
            // Return a default "Safe/Unknown" object instead of null
            return successResponse({
                phoneNumber: phoneNumber,
                riskLevel: RiskLevel.UNKNOWN,
                description: "No record found in database"
            });
        }
        return successResponse(record);
    }

    const allData = getCellphoneData();
    return successResponse(allData);
  }
}

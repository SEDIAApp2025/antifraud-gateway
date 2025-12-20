export enum RiskLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  UNKNOWN = "UNKNOWN"
}

export interface StandardResponse<T> {
  success: boolean;
  version: string;
  data?: T;
  error?: string;
}

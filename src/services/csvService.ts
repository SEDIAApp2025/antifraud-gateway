import rawCsv from "../data/cellphones.csv";
import { csvToJson } from "../utils/csvToJson";
import { RiskLevel } from "../types";

interface CsvRecord {
    id: number;
    source_number: string;
    risk_level: string;
    description: string;
}

export interface CellphoneRecord {
    id: number;
    phoneNumber: string;
    riskLevel: RiskLevel;
    description: string;
}

export function getCellphoneData(): CellphoneRecord[] {
    const rawRecords = csvToJson<CsvRecord>(rawCsv);
    return rawRecords.map(record => ({
        id: record.id,
        phoneNumber: record.source_number,
        riskLevel: record.risk_level as RiskLevel,
        description: record.description
    }));
}

export function getCellphoneByNumber(phoneNumber: string): CellphoneRecord | undefined {
    const allData = getCellphoneData();
    return allData.find(record => record.phoneNumber === phoneNumber);
}

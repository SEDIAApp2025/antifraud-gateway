export function csvToJson<T = any>(csv: string): T[] {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const result: T[] = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length !== headers.length) continue; // Skip malformed lines

        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
            let value = currentLine[j].trim();
            // Try to convert to number if possible
            if (!isNaN(Number(value)) && value !== '') {
                 // Keep phone numbers as strings if they start with 0 and are long enough, otherwise number
                 // Actually, for safety, let's keep everything as string unless we are sure.
                 // The user example has phone numbers like 0987..., converting to number would lose the leading zero.
                 // So let's keep it as string for now, or check if it looks like a phone number.
                 // For this specific CSV, we have id (number), source_number (string), category (string), description (string).
                 if (headers[j] === 'id') {
                     obj[headers[j]] = Number(value);
                 } else {
                     obj[headers[j]] = value;
                 }
            } else {
                obj[headers[j]] = value;
            }
        }
        result.push(obj);
    }
    return result;
}

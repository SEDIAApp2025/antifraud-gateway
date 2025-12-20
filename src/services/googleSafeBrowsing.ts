interface ThreatEntry {
    url: string;
}

interface ThreatInfo {
    threatTypes: string[];
    platformTypes: string[];
    threatEntryTypes: string[];
    threatEntries: ThreatEntry[];
}

interface SafeBrowsingRequest {
    client: {
        clientId: string;
        clientVersion: string;
    };
    threatInfo: ThreatInfo;
}

interface ThreatMatch {
    threatType: string;
    platformType: string;
    threatEntryType: string;
    threat: { url: string };
    cacheDuration: string;
}

interface SafeBrowsingResponse {
    matches?: ThreatMatch[];
}

export async function checkUrlSafety(url: string, apiKey: string): Promise<{ isSafe: boolean; threatType?: string }> {
    if (!apiKey) {
        throw new Error("Google Safe Browsing API key is missing");
    }
    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;


    const requestBody: SafeBrowsingRequest = {
        client: {
            clientId: "antifraud-gateway",
            clientVersion: "1.0.1"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [
                { url: url }
            ]
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            console.error("Google Safe Browsing API Error:", response.status, await response.text());
            throw new Error(`Google Safe Browsing API failed with status ${response.status}`);
        }

        const data: SafeBrowsingResponse = await response.json();

        if (data.matches && data.matches.length > 0) {
            return {
                isSafe: false,
                threatType: data.matches[0].threatType
            };
        }

        return { isSafe: true };

    } catch (error) {
        console.error("Error checking URL safety:", error);
        throw error;
    }
}

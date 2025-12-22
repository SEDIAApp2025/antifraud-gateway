const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config/index.ts');

try {
    let content = fs.readFileSync(configPath, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    
    // Regex to match: export const LAST_UPDATED = "YYYY-MM-DD";
    const regex = /export const LAST_UPDATED = ".*";/;
    
    if (regex.test(content)) {
        const newContent = content.replace(regex, `export const LAST_UPDATED = "${today}";`);
        fs.writeFileSync(configPath, newContent);
        console.log(`[Metadata] Updated LAST_UPDATED to ${today}`);
    } else {
        console.warn('[Metadata] LAST_UPDATED constant not found in src/config/index.ts');
    }
} catch (error) {
    console.error('[Metadata] Error updating metadata:', error);
    process.exit(1);
}

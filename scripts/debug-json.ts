
function extractJsonFromText(text: string): any {
    let startIndex = text.indexOf('{');
    while (startIndex !== -1) {
        let braceCount = 0;
        let endIndex = -1;
        
        for (let i = startIndex; i < text.length; i++) {
            if (text[i] === '{') braceCount++;
            else if (text[i] === '}') braceCount--;
            
            if (braceCount === 0) {
                endIndex = i;
                break;
            }
        }
        
        if (endIndex !== -1) {
            const jsonStr = text.substring(startIndex, endIndex + 1);
            console.log("Found potential JSON:", jsonStr);
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.action || parsed.reply || parsed.message || parsed.text || parsed.content) {
                    return parsed;
                }
            } catch (e: any) {
                console.log("Parse error:", e.message);
            }
        }
        
        startIndex = text.indexOf('{', startIndex + 1);
    }
    return null;
}

const input = `Deploying now! 🦞🚀

\`\`\`json
{
  "action": "create_market",
  "parameters": {
    "metadataUri": "ipfs://QmDummyPlaceholder",
    "tradingDeadline": 1743379200,
    "resolveTime": 1754035200
  }
}
\`\`\`

**📦 Market Summary:**
`;

const result = extractJsonFromText(input);
console.log("Result:", result);

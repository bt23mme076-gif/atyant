const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('c:/Users/jatin/AppData/Roaming/Code/User/workspaceStorage/9e40948874b63c0b7de8581660498c98/GitHub.copilot-chat/transcripts/9ed9c823-03e6-4792-bb86-9ffe4c64a4c4.jsonl')
});
rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (data.data && data.data.content && typeof data.data.content === 'string' && data.data.content.includes('import React')) {
        if (data.data.content.includes('IntelligenceTerminal')) {
            fs.writeFileSync('restored_IntelligenceTerminal.txt', data.data.content, {flag: 'a'});
        }
    }
  } catch (e) {}
});

const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('c:/Users/jatin/AppData/Roaming/Code/User/workspaceStorage/9e40948874b63c0b7de8581660498c98/GitHub.copilot-chat/transcripts/9ed9c823-03e6-4792-bb86-9ffe4c64a4c4.jsonl')
});
rl.on('line', (line) => {
  try {
    const json = JSON.parse(line);
    const data = json.data;
    if (data && data.toolRequests) {
        data.toolRequests.forEach(req => {
            if (req.arguments && typeof req.arguments === 'string') {
                const args = JSON.parse(req.arguments);
                if (args.content && args.content.includes('IntelligenceTerminal')) {
                    fs.writeFileSync('restored_from_tool.txt', args.content, {flag: 'a'});
                }
                if (args.command && args.command.includes('IntelligenceTerminal')) {
                    fs.writeFileSync('restored_from_cmd.txt', args.command + '\n======\n', {flag: 'a'});
                }
                if (args.newString && args.newString.includes('IntelligenceTerminal')) {
                    fs.writeFileSync('restored_from_replace.txt', args.newString + '\n====\n', {flag: 'a'});
                }
            }
        });
    }
  } catch (e) {}
});

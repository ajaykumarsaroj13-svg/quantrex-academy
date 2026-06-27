const fs = require('fs');
const content = fs.readFileSync('C:/Users/Admin/.gemini/antigravity/brain/9258c762-64f2-4a36-9c75-51c0271bfbb8/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const tc of data.tool_calls) {
         if (tc.name === 'run_command' && tc.arguments.CommandLine) {
            const cmd = tc.arguments.CommandLine.toLowerCase();
            if (cmd.includes('vercel') || cmd.includes('git ') || cmd.includes('deploy')) {
              console.log(cmd);
            }
         }
      }
    }
  } catch(e) {}
}

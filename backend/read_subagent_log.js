import fs from 'fs';

const logPath = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d574c5b9-a33e-45a3-9473-cd56e012fce1\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logPath)) {
  console.log('Subagent transcript does not exist at:', logPath);
  process.exit(0);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Read ${lines.length} lines from subagent transcript.`);

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'PLANNER_RESPONSE' || obj.type === 'USER_INPUT' || obj.type === 'SUBAGENT_RESPONSE') {
      console.log(`Step ${obj.step_index || idx} (${obj.source}):`, obj.content);
    }
  } catch (err) {
    // ignore
  }
});

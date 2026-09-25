const fs = require('fs');
const readline = require('readline');

async function getNext() {
  const stream = fs.createReadStream('C:/Users/manan/.gemini/antigravity-ide/brain/31c3cd03-507a-4bd9-ac76-175afd30eb72/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let found = false;
  let count = 0;
  for await (const line of rl) {
    if (line.includes('revisit the map functionality')) {
      found = true;
      continue;
    }
    if (found && line.includes('"type":"USER_INPUT"')) {
      const parsed = JSON.parse(line);
      console.log('=== USER PROMPT ===');
      console.log((parsed.content || '').slice(0, 300));
      count++;
      if (count > 5) break;
    }
  }
}
getNext();

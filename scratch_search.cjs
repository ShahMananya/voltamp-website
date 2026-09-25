const fs = require('fs');
const readline = require('readline');

async function search() {
  const stream = fs.createReadStream('C:/Users/manan/.gemini/antigravity-ide/brain/31c3cd03-507a-4bd9-ac76-175afd30eb72/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let count = 0;
  for await (const line of rl) {
    if (line.includes('"USER_INPUT"')) {
      try {
        const parsed = JSON.parse(line);
        count++;
        let content = parsed.content || '';
        const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        const req = match ? match[1].trim() : content.trim();
        if (/map|globe|twin|spatial|footprint|india|state/i.test(req)) {
          console.log(`[#${count}] ${req}\n---`);
        }
      } catch (e) {}
    }
  }
}
search();

/**
 * Automated IndexNow Submitter for VOLAMP ELEKTRIKALS PVT. LTD.
 * Instantly notifies Bing, Microsoft Copilot, and Yandex of newly published or updated URLs.
 * 
 * Usage:
 *   npx tsx server/scripts/submitIndexNow.ts
 */

import axios from "axios";
import { INDEXNOW_KEY, getIndexNowUrlList } from "../seoRoutes";

async function main() {
  console.log("=== VOLAMP IndexNow Instant Dispatcher ===");
  console.log(`IndexNow Key: ${INDEXNOW_KEY}`);
  console.log(`Key Location: https://www.volampelektrikals.com/${INDEXNOW_KEY}.txt`);

  const urls = getIndexNowUrlList();
  console.log(`Total canonical URLs gathered: ${urls.length}`);

  const payload = {
    host: "www.volampelektrikals.com",
    key: INDEXNOW_KEY,
    keyLocation: `https://www.volampelektrikals.com/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const endpoints = [
    { name: "IndexNow Global (api.indexnow.org)", url: "https://api.indexnow.org/indexnow" },
    { name: "Bing Direct (www.bing.com)", url: "https://www.bing.com/indexnow" },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`Dispatching ${urls.length} URLs to ${ep.name}...`);
      const resp = await axios.post(ep.url, payload, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        timeout: 15000,
      });
      console.log(`[SUCCESS] ${ep.name} responded with HTTP ${resp.status} (${resp.statusText || "OK"})`);
    } catch (err: any) {
      if (err.response) {
        console.warn(`[NOTICE] ${ep.name} returned HTTP ${err.response.status}: ${JSON.stringify(err.response.data || err.response.statusText)}`);
      } else {
        console.warn(`[OFFLINE/LOCAL NOTICE] Could not reach ${ep.name} directly: ${err.message}`);
      }
    }
  }

  console.log("\nSummary of submitted URL breakdown:");
  console.log(`- Static Hubs & Brand Pages: 23`);
  console.log(`- Verified Master Categories: 8`);
  console.log(`- Answer-First Engineering Knowledge Guides: 28`);
  console.log(`- Priority Core Product SKUs: ${urls.length - 23 - 8 - 28}`);
  console.log("=== Dispatch Complete ===");
}

main().catch((err) => {
  console.error("IndexNow script execution error:", err);
  process.exit(1);
});

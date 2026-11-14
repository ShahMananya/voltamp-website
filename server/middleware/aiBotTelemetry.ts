/**
 * AI Crawler & Retrieval Telemetry Middleware for VOLAMP ELEKTRIKALS
 * Tracks AI bot crawl frequency (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
 * and inbound AI referral traffic (from chatgpt.com, perplexity.ai, claude.ai, etc.)
 * 
 * Complies with Phase 9 (Step 133) and Phase 11 (Step 147) of AEO/GEO Implementation.
 */

import type { Request, Response, NextFunction } from "express";

interface AiBotHit {
  timestamp: string;
  bot: string;
  url: string;
  method: string;
  statusCode?: number;
  ip?: string;
}

interface AiReferralHit {
  timestamp: string;
  referrer: string;
  landingUrl: string;
  userAgent: string;
}

interface TelemetryState {
  startedAt: string;
  totalAiBotHits: number;
  totalAiReferrals: number;
  hitsByBot: Record<string, number>;
  hitsByEndpoint: Record<string, number>;
  referralsByEngine: Record<string, number>;
  recentBotHits: AiBotHit[];
  recentReferrals: AiReferralHit[];
}

const KNOWN_AI_BOTS: Record<string, string> = {
  "gptbot": "OpenAI GPTBot",
  "oai-searchbot": "OpenAI OAI-SearchBot",
  "chatgpt-user": "ChatGPT User Fetcher",
  "claudebot": "Anthropic ClaudeBot",
  "claude-searchbot": "Anthropic Claude-SearchBot",
  "claude-web": "Anthropic Claude-Web",
  "perplexitybot": "Perplexity AI PerplexityBot",
  "google-extended": "Google Gemini (Google-Extended)",
  "googleother": "Google Gemini (GoogleOther)",
  "amazonbot": "Amazonbot AI",
  "bytespider": "ByteDance Bytespider",
  "meta-externalagent": "Meta AI Agent",
  "applebot-extended": "Apple Intelligence (Applebot-Extended)",
  "diffbot": "Diffbot Knowledge Graph",
};

const KNOWN_AI_REFERRERS: Record<string, string> = {
  "chatgpt.com": "ChatGPT Search",
  "perplexity.ai": "Perplexity AI",
  "claude.ai": "Anthropic Claude",
  "gemini.google.com": "Google Gemini",
  "copilot.microsoft.com": "Microsoft Copilot",
};

const telemetryState: TelemetryState = {
  startedAt: new Date().toISOString(),
  totalAiBotHits: 0,
  totalAiReferrals: 0,
  hitsByBot: {},
  hitsByEndpoint: {},
  referralsByEngine: {},
  recentBotHits: [],
  recentReferrals: [],
};

export function aiBotTelemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const referer = (req.headers["referer"] || req.headers["referrer"] || "").toString().toLowerCase();

  // 1. Detect AI Bot Crawler
  let matchedBot: string | null = null;
  for (const [key, label] of Object.entries(KNOWN_AI_BOTS)) {
    if (ua.includes(key)) {
      matchedBot = label;
      break;
    }
  }

  if (matchedBot) {
    telemetryState.totalAiBotHits++;
    telemetryState.hitsByBot[matchedBot] = (telemetryState.hitsByBot[matchedBot] || 0) + 1;
    
    // Group endpoint to prevent cardinality explosion (strip specific IDs)
    const cleanUrl = req.path.startsWith("/product/") ? "/product/:id" : req.path;
    telemetryState.hitsByEndpoint[cleanUrl] = (telemetryState.hitsByEndpoint[cleanUrl] || 0) + 1;

    const hit: AiBotHit = {
      timestamp: new Date().toISOString(),
      bot: matchedBot,
      url: req.originalUrl || req.url,
      method: req.method,
      ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim(),
    };

    // Keep ring-buffer of latest 100 bot hits
    telemetryState.recentBotHits.unshift(hit);
    if (telemetryState.recentBotHits.length > 100) {
      telemetryState.recentBotHits.pop();
    }
  }

  // 2. Detect Inbound AI Referral Traffic
  let matchedReferrer: string | null = null;
  for (const [domain, label] of Object.entries(KNOWN_AI_REFERRERS)) {
    if (referer.includes(domain)) {
      matchedReferrer = label;
      break;
    }
  }

  if (matchedReferrer) {
    telemetryState.totalAiReferrals++;
    telemetryState.referralsByEngine[matchedReferrer] = (telemetryState.referralsByEngine[matchedReferrer] || 0) + 1;

    const refHit: AiReferralHit = {
      timestamp: new Date().toISOString(),
      referrer: matchedReferrer,
      landingUrl: req.originalUrl || req.url,
      userAgent: req.headers["user-agent"] || "",
    };

    telemetryState.recentReferrals.unshift(refHit);
    if (telemetryState.recentReferrals.length > 50) {
      telemetryState.recentReferrals.pop();
    }
  }

  next();
}

export function getAiTelemetrySummary() {
  return {
    ...telemetryState,
    uptimeSeconds: Math.floor((Date.now() - new Date(telemetryState.startedAt).getTime()) / 1000),
  };
}

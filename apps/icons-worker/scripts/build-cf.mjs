#!/usr/bin/env node
/**
 * Builds `apps/icons-worker` (Worker bundle + static Web UI assets) into
 * Cloudflare Build Output Specification v1 (`.cloudflare/output/v1/`) so it
 * deploys cleanly with `cf deploy --prebuilt`.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(workerRoot, "../..");
const outVersionDir = path.join(workerRoot, ".cloudflare", "output", "v1");
const defaultWorkerDir = path.join(outVersionDir, "workers", "default");
const bundleDir = path.join(defaultWorkerDir, "bundle");

function stripJsonComments(src) {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += "\n";
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return out.replace(/,\s*([}\]])/g, "$1");
}

function resolveBun() {
  const candidates = ["bun", "/root/.bun/bin/bun"];
  for (const bin of candidates) {
    try {
      execFileSync(bin, ["--version"], { stdio: "ignore" });
      return bin;
    } catch {
      // try next
    }
  }
  throw new Error("Could not find bun binary to bundle Worker.");
}

const wranglerRaw = fs.readFileSync(path.join(workerRoot, "wrangler.jsonc"), "utf8");
const cfg = JSON.parse(stripJsonComments(wranglerRaw));

fs.rmSync(path.join(workerRoot, ".cloudflare", "output"), { recursive: true, force: true });
fs.mkdirSync(bundleDir, { recursive: true });

// 1. Bundle Worker API + MCP server
const entryFile = path.join(workerRoot, cfg.main || "src/index.ts");
const outFile = path.join(bundleDir, "index.js");
execFileSync(
  resolveBun(),
  ["build", entryFile, "--target=browser", "--format=esm", "--outfile", outFile],
  { cwd: workerRoot, stdio: "inherit" },
);

// 2. Build standalone public Web UI assets using workspace Vite + Tailwind
execFileSync(
  "pnpm",
  ["--dir", path.join(repoRoot, "apps/docs"), "exec", "vite", "build", "--config", path.join(workerRoot, "vite.config.mjs")],
  { cwd: repoRoot, stdio: "inherit" },
);

const rootConfig = {
  settings: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "74550e1c7a5a36e9cb05c5ad681add98",
  },
  buildContext: {
    isPreview: false,
  },
};

const envBindings = {};
if (cfg.assets?.binding) {
  envBindings[cfg.assets.binding] = { type: "assets" };
}
for (const [key, value] of Object.entries(cfg.vars ?? {})) {
  envBindings[key] = { type: "text", value: String(value) };
}
for (const d1 of cfg.d1_databases ?? []) {
  envBindings[d1.binding] = {
    type: "d1",
    ...(d1.database_name ? { name: d1.database_name } : {}),
    ...(d1.database_id && d1.database_id !== "REPLACE_WITH_D1_DATABASE_ID" ? { id: d1.database_id } : {}),
  };
}

const domains = (cfg.routes ?? [])
  .filter((r) => typeof r === "object" && r?.custom_domain && r?.pattern)
  .map((r) => r.pattern);

const workerConfig = {
  name: cfg.name,
  compatibilityDate: cfg.compatibility_date,
  ...(cfg.assets
    ? {
        assets: {
          htmlHandling: cfg.assets.html_handling,
          notFoundHandling: cfg.assets.not_found_handling,
          runWorkerFirst: cfg.assets.run_worker_first,
        },
      }
    : {}),
  ...(domains.length > 0 ? { domains } : {}),
  workersDev: true,
  env: envBindings,
  manifest: {
    type: "complete",
    mainModule: "index.js",
    modules: {
      "index.js": { type: "esm" },
    },
  },
};

fs.writeFileSync(path.join(outVersionDir, "config.json"), JSON.stringify(rootConfig, null, 2) + "\n");
fs.writeFileSync(path.join(defaultWorkerDir, "worker.config.json"), JSON.stringify(workerConfig, null, 2) + "\n");

console.log(`build-cf: bundled Worker + static assets (${domains.join(", ") || "workers.dev"})`);

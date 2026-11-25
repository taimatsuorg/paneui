#!/usr/bin/env node
/**
 * Seeds the cloud Cloudflare D1 `icons` table from `src/catalog.generated.json`
 * using `INSERT OR IGNORE` so existing online MCP icons/edits are preserved.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(workerRoot, "src", "catalog.generated.json");
const wranglerPath = path.join(workerRoot, "wrangler.jsonc");

function stripJsonComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
}

function resolveCf() {
  for (const bin of ["cf", "/root/.bun/bin/cf"]) {
    try {
      execFileSync(bin, ["--version"], { stdio: "ignore" });
      return bin;
    } catch {
      // try next
    }
  }
  throw new Error("Could not find `cf` CLI binary.");
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const wranglerCfg = JSON.parse(stripJsonComments(fs.readFileSync(wranglerPath, "utf8")));
const dbId = wranglerCfg?.d1_databases?.[0]?.database_id;
if (!dbId || dbId === "REPLACE_WITH_D1_DATABASE_ID") {
  throw new Error("Missing D1 database_id in apps/icons-worker/wrangler.jsonc");
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
if (!Array.isArray(catalog) || catalog.length === 0) {
  throw new Error("Catalog is empty. Run `pnpm icons:catalog` first.");
}

const cfBin = resolveCf();
const env = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "74550e1c7a5a36e9cb05c5ad681add98",
  CI: "true",
};

const now = new Date().toISOString();
const BATCH_SIZE = 20;

for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
  const chunk = catalog.slice(i, i + BATCH_SIZE);
  const sql = chunk
    .map(
      (item) =>
        `INSERT OR IGNORE INTO icons (name, component, category, tags, variant, body, svg, jsx, source, created_at, updated_at) VALUES (${[
          sqlStr(item.name),
          sqlStr(item.component),
          sqlStr(item.category),
          sqlStr(JSON.stringify(item.tags ?? [])),
          sqlStr(item.variant === "filled" ? "filled" : "outline"),
          sqlStr(item.body),
          sqlStr(item.svg),
          sqlStr(item.jsx),
          sqlStr(item.source === "mcp" ? "mcp" : "builtin"),
          sqlStr(now),
          sqlStr(now),
        ].join(", ")});`,
    )
    .join(" ");

  execFileSync(cfBin, ["d1", "query", dbId, "--sql", sql], { cwd: workerRoot, env, stdio: "inherit" });
  console.log(`seed-d1: processed ${Math.min(i + BATCH_SIZE, catalog.length)}/${catalog.length}`);
}

const countOut = execFileSync(cfBin, ["d1", "query", dbId, "--sql", "SELECT COUNT(*) AS total FROM icons;"], {
  cwd: workerRoot,
  env,
  encoding: "utf8",
});
console.log(countOut);

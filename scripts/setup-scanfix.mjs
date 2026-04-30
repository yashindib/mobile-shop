#!/usr/bin/env node
/**
 * Interactive CLI to configure the Scanfix API key in .env.local
 * Run: node scripts/setup-scanfix.mjs
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../.env.local");

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const lines = fs.readFileSync(ENV_PATH, "utf-8").split("\n");
  const vars = {};
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) vars[match[1].trim()] = match[2].trim();
  }
  return vars;
}

function writeEnvFile(vars) {
  const content = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.writeFileSync(ENV_PATH, content, "utf-8");
}

function maskKey(key) {
  if (!key) return "(not set)";
  return key.slice(0, 12) + "..." + key.slice(-4);
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n  Scanfix API Key Setup");
  console.log("  ─────────────────────");

  const vars = readEnvFile();
  const current = vars["SCANFIX_API_KEY"] ?? vars["NEXT_PUBLIC_SCANFIX_API_KEY"];

  console.log(`  Current key: ${maskKey(current)}`);
  console.log("");

  const input = await prompt(
    "  Paste your new Scanfix API key (press Enter to keep current):\n  > "
  );

  const newKey = input || current;

  if (!newKey) {
    console.log("\n  No key set. Run this script again when you have your key.\n");
    process.exit(1);
  }

  vars["SCANFIX_API_KEY"] = newKey;
  vars["NEXT_PUBLIC_SCANFIX_API_KEY"] = newKey;
  writeEnvFile(vars);

  console.log(`\n  Saved to .env.local  (${maskKey(newKey)})\n`);
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Scanfix Errors MCP Server
 * Exposes a get_last_errors tool that queries the local PostgreSQL error log.
 *
 * Claude Code connects to this via .mcp.json — no manual startup needed.
 * To configure credentials: node scripts/setup-scanfix.mjs
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import pg from "pg";
import dotenv from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

if (!process.env.DATABASE_URL) {
  process.stderr.write(
    "[scanfix-errors] ERROR: DATABASE_URL is not set.\n" +
    "Run: node scripts/setup-scanfix.mjs to configure it.\n"
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const server = new McpServer({
  name: "scanfix-errors",
  version: "1.0.0",
});

server.tool(
  "get_last_errors",
  "Returns the last N errors captured from the Mobelo shop app (default 3). " +
  "Each error includes its level (ERROR/WARN/INFO), message, source component, " +
  "timestamp, and any extra context. Use this to understand what bugs are " +
  "currently happening before fixing them.",
  {
    count: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .default(3)
      .describe("Number of most-recent errors to return (default 3, max 50)"),
  },
  async ({ count }) => {
    try {
      const result = await pool.query(
        `SELECT id, level, message, source, context, timestamp
         FROM "ErrorLog"
         ORDER BY timestamp DESC
         LIMIT $1`,
        [count]
      );

      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No errors found yet. Open the app in a browser to trigger some, then try again.",
            },
          ],
        };
      }

      const formatted = result.rows.map((row, i) => {
        const ts = new Date(row.timestamp).toLocaleString();
        const ctx = row.context ? JSON.stringify(row.context, null, 2) : "none";
        return `Error ${i + 1} of ${result.rows.length}:
  Level   : ${row.level}
  Time    : ${ts}
  Source  : ${row.source}
  Message : ${row.message}
  Context : ${ctx}`;
      });

      return {
        content: [
          {
            type: "text",
            text: `Last ${result.rows.length} error(s) from the Mobelo shop:\n\n${formatted.join("\n\n---\n\n")}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Database error: ${err.message}\n\nMake sure PostgreSQL is running and DATABASE_URL is correct in .env.local`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

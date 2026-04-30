import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SCANFIX_API_KEY =
  process.env.SCANFIX_API_KEY ??
  process.env.NEXT_PUBLIC_SCANFIX_API_KEY;

const SCANFIX_UPSTREAM_URL = "https://api.scanfix.ai/logs/ingest";

async function saveToDb(body: string) {
  try {
    const parsed = JSON.parse(body);
    // Scanfix SDK batches logs as { logs: [...] }
    const entries: unknown[] = parsed?.logs ?? (Array.isArray(parsed) ? parsed : [parsed]);

    for (const entry of entries) {
      const e = entry as Record<string, unknown>;
      const meta = e.metadata as Record<string, unknown> | undefined;
      await prisma.errorLog.create({
        data: {
          level: String(e.level ?? "ERROR"),
          message: String(e.message ?? "Unknown error"),
          source: String(e.source ?? meta?.source ?? "unknown"),
          context: {
            stack: e.stack,
            metadata: meta,
            sessionId: e.sessionId,
            page: meta?.page,
          },
        },
      });
    }
  } catch {
    // DB write failure must never break the Scanfix proxy
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const [upstreamResponse] = await Promise.all([
      fetch(SCANFIX_UPSTREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SCANFIX_API_KEY ?? "",
        },
        body,
      }),
      saveToDb(body),
    ]);

    const responseText = await upstreamResponse.text();

    return new NextResponse(responseText || null, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 500 }
    );
  }
}

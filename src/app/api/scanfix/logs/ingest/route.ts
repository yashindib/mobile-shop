import { NextResponse } from "next/server";

const SCANFIX_API_KEY =
  process.env.SCANFIX_API_KEY ??
  process.env.NEXT_PUBLIC_SCANFIX_API_KEY ??
  "sf_8db515f073d7dc9f26bbef37c1b697a19ccaf7a7b2eef95c";

const SCANFIX_UPSTREAM_URL = "https://api.scanfix.ai/logs/ingest";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const upstreamResponse = await fetch(SCANFIX_UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SCANFIX_API_KEY,
      },
      body,
    });

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

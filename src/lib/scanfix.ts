"use client";

import { captureError, init, log } from "@scanfix/browser";

type ScanfixLevel = "INFO" | "WARN" | "ERROR";

const FALLBACK_SCANFIX_API_KEY = "sf_98423c2fd2fa5b0a7fa4ff017dce73e004b2a3601a1836cb";
const SCANFIX_PROXY_API_URL = "/api/scanfix";

const INIT_KEY = "__scanfix_initialized__";

function safeSerialize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "object" && value !== null) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }

  return value;
}

export function scanfixLog(
  level: ScanfixLevel,
  message: string,
  source: string,
  context?: Record<string, unknown>
) {
  log(level, `[${source}] ${message}`, {
    ...context,
    source,
    timestamp: new Date().toISOString(),
  });
}

export function reportApiFailure(url: string, status?: number, detail?: unknown) {
  scanfixLog("ERROR", "API request failure", "api", {
    url,
    status,
    detail: safeSerialize(detail),
  });

  captureError(new Error(`API request failure: ${url}`), {
    url,
    status,
    detail: safeSerialize(detail),
  });
}

export function reportAxiosFailure(error: unknown) {
  const maybeErr = error as { config?: { url?: string }; response?: { status?: number } };
  reportApiFailure(
    maybeErr?.config?.url ?? "axios-request",
    maybeErr?.response?.status,
    error
  );
}

export function scanfixCaptureError(
  error: Error | string,
  context?: Record<string, unknown>
) {
  captureError(error, context);
}

export function initScanfix() {
  if (typeof window === "undefined") return;
  if ((window as Window & { [INIT_KEY]?: boolean })[INIT_KEY]) return;

  const apiKey =
    process.env.NEXT_PUBLIC_SCANFIX_API_KEY ?? FALLBACK_SCANFIX_API_KEY;

  init({
    apiKey,
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    apiUrl: SCANFIX_PROXY_API_URL,
  });

  (window as Window & { [INIT_KEY]?: boolean })[INIT_KEY] = true;

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    scanfixLog("ERROR", "console.error captured", "console", {
      args: args.map(safeSerialize),
    });

    captureError(new Error("console.error captured"), {
      args: args.map(safeSerialize),
    });

    originalConsoleError(...args);
  };

  window.addEventListener("error", (event) => {
    scanfixLog("ERROR", event.message || "Uncaught exception", "window.error", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    scanfixLog("ERROR", "Unhandled promise rejection", "window.unhandledrejection", {
      reason: safeSerialize(event.reason),
    });
  }, { passive: true });

  scanfixLog("INFO", "Scanfix initialized", "init", {
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  });
}

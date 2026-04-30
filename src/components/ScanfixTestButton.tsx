"use client";

import { scanfixCaptureError, scanfixLog } from "@/lib/scanfix";

export default function ScanfixTestButton() {
  const sendManualLog = () => {
    scanfixLog("INFO", "Manual Scanfix test log from UI", "manual-test", {
      page: window.location.pathname,
    });
  };

  const triggerError = () => {
    const error = new Error("FrontendErrorTrackingVerification");
    error.name = "ScanfixFrontendTestError";

    scanfixCaptureError(error, {
      source: "manual-test",
      page: window.location.pathname,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <button
        onClick={sendManualLog}
        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
      >
        Send Test Log
      </button>
      <button
        onClick={triggerError}
        className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
      >
        Trigger Test Error
      </button>
    </div>
  );
}

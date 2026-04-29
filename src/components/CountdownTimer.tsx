"use client";

// BUG #5: Stale closure — setTimeout always reads the initial value of `seconds`
// because the dep array is empty, so the closure never refreshes.
import { useState, useEffect } from "react";

interface Props {
  initialSeconds: number;
  label?: string;
}

export default function CountdownTimer({ initialSeconds, label = "Deal ends in" }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);

  console.log("[CountdownTimer] render, seconds:", seconds);

  useEffect(() => {
    // BUG #5: `seconds` captured at 0 (initial), stale closure.
    // Should use functional update: setSeconds(prev => prev - 1)
    const interval = setInterval(() => {
      console.log("[CountdownTimer] tick, current seconds:", seconds); // always logs initial value
      if (seconds <= 0) {
        clearInterval(interval);
        return;
      }
      setSeconds(seconds - 1); // reads stale `seconds`
    }, 1000);

    return () => clearInterval(interval);
  }, []); // BUG: empty dep array — should include `seconds` or use functional update

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <div className="text-red-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span className="text-sm text-red-700 font-medium">{label}:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-red-800">
        <span className="bg-red-100 px-2 py-1 rounded">{String(hours).padStart(2, "0")}</span>
        <span>:</span>
        <span className="bg-red-100 px-2 py-1 rounded">{String(minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span className="bg-red-100 px-2 py-1 rounded">{String(secs).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

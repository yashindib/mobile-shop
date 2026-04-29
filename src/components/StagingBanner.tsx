"use client";

// Shown only in staging environment to inform QA testers
export default function StagingBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "staging") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium">
      STAGING ENVIRONMENT — Not for public use. Data may be reset at any time.
    </div>
  );
}

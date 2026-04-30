"use client";

import { useEffect } from "react";
import { initScanfix } from "@/lib/scanfix";

export default function ScanfixProvider() {
  useEffect(() => {
    initScanfix();
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { captureUtmFromLocation } from "@/lib/utm";

/** ページ最上位に配置し、初回マウント時にURLのUTMパラメータを保存する */
export default function UtmCapture() {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);

  return null;
}

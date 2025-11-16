// app/profiles/PdfViewer.tsx
"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Context } from "../Context";

// Dynamically import with SSR disabled
const PdfViewerClient = dynamic(() => import("./PdfViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      Loading PDF Viewer...
    </div>
  ),
});

export default function PdfViewer() {
  const { state } = use(Context);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const selectedProfile = state.profiles.find(
      (p) => p.id === state.selectedProfileId,
    );
    if (selectedProfile?.resume) {
      const url = URL.createObjectURL(selectedProfile.resume);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [state]);

  if (!pdfUrl) {
    return null;
  }

  return <PdfViewerClient pdfUrl={pdfUrl} />;
}

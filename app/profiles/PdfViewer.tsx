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

type PdfViewerProps = {
  pdfUrl: string;
  setPdfUrl: (url: string) => void;
};

export default function PdfViewer({ pdfUrl, setPdfUrl }: PdfViewerProps) {
  const { state } = use(Context);

  useEffect(() => {
    const selectedProfile = state.profiles.find(
      (p) => p.id === state.selectedProfileId,
    );
    if (selectedProfile?.resume) {
      const url = URL.createObjectURL(selectedProfile.resume);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl("");
    }
  }, [state]);

  if (!pdfUrl) {
    return null;
  }

  return <PdfViewerClient pdfUrl={pdfUrl} />;
}

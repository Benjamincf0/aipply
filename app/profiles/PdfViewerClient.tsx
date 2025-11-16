// src/components/PdfViewerClient.tsx
"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerClientProps {
  pdfUrl: string;
}

export default function PdfViewerClient({ pdfUrl }: PdfViewerClientProps) {
  const [zoom, setZoom] = useState(100);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const baseWidth = 595;

  return (
    <div className="bg-background flex h-full flex-1 flex-col overflow-hidden rounded-2xl">
      {/* Toolbar */}
      <div className="border-border flex flex-none items-center justify-between gap-2 border-b p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Zoom Out
          </button>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Zoom In
          </button>
          <span className="px-2 text-center text-sm">{zoom}%</span>
        </div>

        <div className="flex items-center gap-2">
          {numPages && numPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 text-sm">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() =>
                  setPageNumber(Math.min(numPages, pageNumber + 1))
                }
                disabled={pageNumber >= numPages}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Display */}
      <div className="text-editor-text mb-5 h-full flex-1 overflow-auto">
        <div className="flex min-h-full justify-center p-8">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="spinner">Loading...</div>}
            className="rounded-sm bg-(--editor-bg) shadow-(--shadow-pdf)"
            scale={zoom / 100}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={(baseWidth * zoom) / 100}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

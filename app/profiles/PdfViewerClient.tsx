"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Download } from "lucide-react";
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
  const [transformOrigin, setTransformOrigin] = useState("center center");

  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "document.pdf"; // Customize filename as needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", preventZoom, { passive: false });
    return () => window.removeEventListener("wheel", preventZoom);
  }, []);

  // Handle Ctrl+Scroll zoom with mouse position
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();

      // Get mouse position relative to container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set zoom origin to mouse position
      setTransformOrigin(`${x}px ${y}px`);

      // Update zoom (smoother with smaller increments)
      const delta = e.deltaY > 0 ? -10 : 10;
      const newZoom = Math.max(50, Math.min(200, zoom + delta));
      setZoom(newZoom);
    }
  };

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
            +
          </button>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="rounded-md border px-3 py-1 text-sm"
          >
            -
          </button>
          <span className="px-2 text-center text-sm">{zoom}%</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="hover:bg-muted flex items-center rounded-md border p-2"
          >
            <Download className="inline-block h-4 w-4" />
          </button>
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
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="mb-5 max-h-[calc(100vh-200px)] w-full max-w-[595px] flex-1 overflow-auto p-8"
      >
        <div
          className="inline-block transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: transformOrigin,
          }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="spinner">Loading...</div>}
            className="inline-block max-w-full rounded-sm shadow-md"
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                // width={(baseWidth * zoom) / 100}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={baseWidth}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

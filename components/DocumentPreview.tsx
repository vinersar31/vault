"use client";

import { useEffect } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import type { DocumentMeta } from "@/lib/types";
import { fileKind, formatBytes } from "@/lib/files";

export default function DocumentPreview({
  document,
  onClose,
}: {
  document: DocumentMeta;
  onClose: () => void;
}) {
  const kind = fileKind(document.fileType, document.fileName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${document.title || document.fileName}`}
        className="card relative z-10 flex h-[88vh] w-full max-w-4xl animate-fade-in-up flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {document.title || document.fileName}
            </h2>
            <p className="truncate text-xs text-slate-500">
              {document.fileName} · {formatBytes(document.fileSize)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={document.downloadURL}
              target="_blank"
              rel="noreferrer"
              className="icon-btn"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>
            <a
              href={document.downloadURL}
              download={document.fileName}
              className="icon-btn"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button onClick={onClose} className="icon-btn" title="Close">
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-ink-950/60">
          {kind === "image" ? (
            <div className="flex h-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.downloadURL}
                alt={document.title || document.fileName}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          ) : kind === "pdf" || kind === "text" ? (
            <iframe
              src={document.downloadURL}
              title={document.title || document.fileName}
              className="h-full w-full border-0 bg-white"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
              <FileText size={40} className="text-slate-600" />
              <p className="max-w-xs text-sm">
                Preview isn&apos;t available for this file type. Download or open
                it instead.
              </p>
              <a
                href={document.downloadURL}
                download={document.fileName}
                className="btn-primary"
              >
                <Download size={16} /> Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

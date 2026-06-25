"use client";

import { Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import type { DocumentMeta } from "@/lib/types";
import { fileKind, formatBytes, KIND_COLOR, relativeTime } from "@/lib/files";

interface DocumentCardProps {
  document: DocumentMeta;
  categoryName: string | null;
  onPreview: (document: DocumentMeta) => void;
  onEdit: (document: DocumentMeta) => void;
  onDelete: (document: DocumentMeta) => void;
}

export default function DocumentCard({
  document,
  categoryName,
  onPreview,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const kind = fileKind(document.fileType, document.fileName);
  const color = KIND_COLOR[kind];

  return (
    <div className="card group flex flex-col p-5 transition-colors hover:border-white/10">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onPreview(document)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1f` }}
          title="Preview"
        >
          <FileText size={18} style={{ color }} />
        </button>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onPreview(document)}
            className="block w-full truncate text-left font-semibold text-slate-100 transition-colors group-hover:text-white"
          >
            {document.title || "Untitled document"}
          </button>
          <p className="mt-0.5 text-xs text-slate-500">
            Added {relativeTime(document.createdAt)}
          </p>
        </div>
      </div>

      {(categoryName || document.tags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categoryName && (
            <span className="rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-300">
              {categoryName}
            </span>
          )}
          {document.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {document.notes && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {document.notes}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <FileText size={14} className="shrink-0" />
          <span className="truncate">{document.fileName}</span>
          <span className="shrink-0">· {formatBytes(document.fileSize)}</span>
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onPreview(document)}
            title="Preview"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-brand-300"
          >
            <Eye size={16} />
          </button>
          <a
            href={document.downloadURL}
            target="_blank"
            rel="noreferrer"
            download={document.fileName}
            title="Download"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-brand-300"
          >
            <Download size={16} />
          </a>
          <button
            onClick={() => onEdit(document)}
            title="Edit"
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-white/5 hover:text-white focus:opacity-100 group-hover:opacity-100"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete"
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 focus:opacity-100 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

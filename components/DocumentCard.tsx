"use client";

import { Calendar, Download, FileText, Pencil, Trash2 } from "lucide-react";
import type { DocumentMeta } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentCardProps {
  document: DocumentMeta;
  categoryName: string | null;
  onEdit: (document: DocumentMeta) => void;
  onDelete: (document: DocumentMeta) => void;
}

export default function DocumentCard({
  document,
  categoryName,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-2">
          {document.title || "Untitled Document"}
        </h3>
        <span className="flex items-center text-xs text-slate-400 gap-1 shrink-0 mt-1">
          <Calendar size={12} />
          {new Date(document.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {categoryName && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-medium">
            {categoryName}
          </span>
        )}
        {document.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {document.notes && (
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {document.notes}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
          <FileText size={14} className="shrink-0" />
          <span className="truncate">{document.fileName}</span>
          <span className="shrink-0">· {formatBytes(document.fileSize)}</span>
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={document.downloadURL}
            target="_blank"
            rel="noreferrer"
            download={document.fileName}
            title="Download"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Download size={16} />
          </a>
          <button
            onClick={() => onEdit(document)}
            title="Edit"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete"
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

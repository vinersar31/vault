// Helpers for classifying, previewing and formatting archived files.

export type FileKind = "image" | "pdf" | "text" | "doc" | "sheet" | "other";

export function fileKind(fileType: string, fileName = ""): FileKind {
  const type = (fileType || "").toLowerCase();
  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("text/") || ["txt", "md", "csv", "json", "log"].includes(ext))
    return "text";
  if (type.includes("word") || ["doc", "docx", "odt", "rtf"].includes(ext))
    return "doc";
  if (
    type.includes("sheet") ||
    type.includes("excel") ||
    ["xls", "xlsx", "ods"].includes(ext)
  )
    return "sheet";
  return "other";
}

/** Whether the browser can render this kind inline in a preview. */
export function canPreview(kind: FileKind): boolean {
  return kind === "image" || kind === "pdf" || kind === "text";
}

export const KIND_LABEL: Record<FileKind, string> = {
  image: "Images",
  pdf: "PDFs",
  text: "Text",
  doc: "Docs",
  sheet: "Sheets",
  other: "Other",
};

export const KIND_COLOR: Record<FileKind, string> = {
  image: "#34d399",
  pdf: "#fb7185",
  text: "#38bdf8",
  doc: "#818cf8",
  sheet: "#fbbf24",
  other: "#94a3b8",
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Short "added X ago" style relative time. */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
  if (diff < day) return `${Math.floor(diff / hour)} h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} d ago`;
  return new Date(ts).toLocaleDateString();
}

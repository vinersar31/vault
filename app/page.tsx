"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  FileText,
  FolderCog,
  Loader2,
  LogOut,
  Search,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthGate from "@/components/AuthGate";
import UploadDocument from "@/components/UploadDocument";
import DocumentCard from "@/components/DocumentCard";
import DocumentPreview from "@/components/DocumentPreview";
import EditDocument from "@/components/EditDocument";
import CategoryManager from "@/components/CategoryManager";
import { ensureDefaultCategories, subscribeCategories } from "@/lib/categories";
import { deleteDocument, subscribeDocuments } from "@/lib/documents";
import { buildSearchIndex, searchDocumentIds } from "@/lib/search";
import { fileKind, formatBytes, KIND_LABEL, type FileKind } from "@/lib/files";
import type { Category, DocumentMeta } from "@/lib/types";

type SortKey = "newest" | "oldest" | "title" | "largest";

const KIND_ORDER: FileKind[] = ["image", "pdf", "doc", "sheet", "text", "other"];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
  { value: "largest", label: "Largest first" },
];

function VaultApp() {
  const { user, signOutUser } = useAuth();

  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeKind, setActiveKind] = useState<FileKind | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  const [previewing, setPreviewing] = useState<DocumentMeta | null>(null);
  const [editing, setEditing] = useState<DocumentMeta | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);

  const seededRef = useRef(false);

  // Live data subscriptions.
  useEffect(() => {
    if (!user) return;
    const unsubDocs = subscribeDocuments(user.uid, (docs) => {
      setDocuments(docs);
      setLoaded(true);
    });
    const unsubCats = subscribeCategories(user.uid, setCategories);
    return () => {
      unsubDocs();
      unsubCats();
    };
  }, [user]);

  // Seed default categories once per user.
  useEffect(() => {
    if (!user || seededRef.current) return;
    seededRef.current = true;
    ensureDefaultCategories(user.uid).catch((err) =>
      console.error("Failed to seed default categories", err)
    );
  }, [user]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const searchIndex = useMemo(
    () => buildSearchIndex(documents, categories),
    [documents, categories]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((doc) => doc.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [documents]);

  const kindsPresent = useMemo(() => {
    const set = new Set<FileKind>();
    documents.forEach((d) => set.add(fileKind(d.fileType, d.fileName)));
    return KIND_ORDER.filter((k) => set.has(k));
  }, [documents]);

  const totalSize = useMemo(
    () => documents.reduce((sum, d) => sum + d.fileSize, 0),
    [documents]
  );

  const results = useMemo(() => {
    let list: DocumentMeta[];
    const trimmed = query.trim();

    if (trimmed) {
      const byId = new Map(documents.map((doc) => [doc.id, doc]));
      list = searchDocumentIds(searchIndex, trimmed)
        .map((id) => byId.get(id))
        .filter((doc): doc is DocumentMeta => Boolean(doc));
    } else {
      list = documents;
    }

    if (activeCategoryId) {
      list = list.filter((doc) => doc.categoryId === activeCategoryId);
    }
    if (activeKind) {
      list = list.filter((doc) => fileKind(doc.fileType, doc.fileName) === activeKind);
    }
    if (activeTags.length > 0) {
      const lowered = activeTags.map((tag) => tag.toLowerCase());
      list = list.filter((doc) => {
        const docTags = doc.tags.map((tag) => tag.toLowerCase());
        return lowered.every((tag) => docTags.includes(tag));
      });
    }

    const sorted = [...list];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "title":
        sorted.sort((a, b) =>
          (a.title || a.fileName).localeCompare(b.title || b.fileName)
        );
        break;
      case "largest":
        sorted.sort((a, b) => b.fileSize - a.fileSize);
        break;
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [query, documents, searchIndex, activeCategoryId, activeKind, activeTags, sort]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const clearFilters = () => {
    setQuery("");
    setActiveCategoryId(null);
    setActiveTags([]);
    setActiveKind(null);
  };

  const handleDelete = async (document: DocumentMeta) => {
    if (!window.confirm(`Delete "${document.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteDocument(document);
    } catch (err) {
      console.error(err);
      window.alert("Could not delete the document. Please try again.");
    }
  };

  const hasFilters =
    Boolean(query.trim()) ||
    activeCategoryId !== null ||
    activeTags.length > 0 ||
    activeKind !== null;

  const userInitial = (
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    "?"
  ).toUpperCase();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-indigo-400 shadow-glow">
              <FileText className="text-ink-950" size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Vault</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Private document archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setManagingCategories(true)}
              className="btn-ghost"
              title="Manage categories"
            >
              <FolderCog size={18} />
              <span className="hidden sm:inline">Categories</span>
            </button>

            <UploadDocument categories={categories} />

            <div className="ml-1 flex items-center gap-2 border-l border-white/10 pl-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-300"
                title={user?.email ?? undefined}
              >
                {userInitial}
              </div>
              <button
                onClick={() => signOutUser()}
                title="Sign out"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Summary */}
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
          <span className="font-semibold text-slate-200 tabular">
            {documents.length}
          </span>
          documents
          <span className="text-slate-600">·</span>
          <span className="tabular">{formatBytes(totalSize)}</span>
          <span className="text-slate-600">·</span>
          <span className="tabular">{categories.length}</span>
          categories
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />
          <input
            type="text"
            className="w-full rounded-2xl border border-white/10 bg-ink-900/70 py-4 pl-12 pr-4 text-base text-slate-100 shadow-card outline-none transition placeholder:text-slate-500 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30"
            placeholder="Search by title, category, tag, or notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category filters + sort */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`chip ${activeCategoryId === null ? "chip-active" : ""}`}
          >
            All
          </button>
          {categories.map((category) => {
            const selected = activeCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(selected ? null : category.id)}
                className={`chip ${selected ? "chip-active" : ""}`}
              >
                {category.name}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1.5 text-slate-400">
            <ArrowDownWideNarrow size={15} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-white/10 bg-ink-850 px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-brand-500/60"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink-850">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File-type filters */}
        {kindsPresent.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {kindsPresent.map((k) => {
              const selected = activeKind === k;
              return (
                <button
                  key={k}
                  onClick={() => setActiveKind(selected ? null : k)}
                  className={`chip ${selected ? "chip-active" : ""}`}
                >
                  {KIND_LABEL[k]}
                </button>
              );
            })}
          </div>
        )}

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mt-5">
            <h2 className="stat-label mb-2 flex items-center gap-1.5">
              <TagIcon size={13} /> Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const selected = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`chip ${selected ? "chip-active" : ""}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="mb-4 mt-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">
            {!loaded
              ? "Loading…"
              : hasFilters
                ? `Results (${results.length})`
                : `All documents (${results.length})`}
          </h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-200"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        {!loaded ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-brand-400" size={28} />
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                categoryName={
                  document.categoryId
                    ? categoryNameById.get(document.categoryId) ?? null
                    : null
                }
                onPreview={setPreviewing}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="card border-dashed py-12 text-center text-slate-400">
            <FileText className="mx-auto mb-3 text-slate-600" size={32} />
            {documents.length === 0 ? (
              <p>Your archive is empty. Upload your first document to get started.</p>
            ) : (
              <p>No documents match your search or filters.</p>
            )}
          </div>
        )}
      </main>

      {previewing && (
        <DocumentPreview
          document={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}

      {editing && (
        <EditDocument
          document={editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}

      {managingCategories && user && (
        <CategoryManager
          categories={categories}
          uid={user.uid}
          onClose={() => setManagingCategories(false)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthGate>
      <VaultApp />
    </AuthGate>
  );
}

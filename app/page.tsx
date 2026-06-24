"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
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
import EditDocument from "@/components/EditDocument";
import CategoryManager from "@/components/CategoryManager";
import { ensureDefaultCategories, subscribeCategories } from "@/lib/categories";
import { deleteDocument, subscribeDocuments } from "@/lib/documents";
import { buildSearchIndex, searchDocumentIds } from "@/lib/search";
import type { Category, DocumentMeta } from "@/lib/types";

function VaultApp() {
  const { user, signOutUser } = useAuth();

  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

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

    if (activeTags.length > 0) {
      const lowered = activeTags.map((tag) => tag.toLowerCase());
      list = list.filter((doc) => {
        const docTags = doc.tags.map((tag) => tag.toLowerCase());
        return lowered.every((tag) => docTags.includes(tag));
      });
    }

    return list;
  }, [query, documents, searchIndex, activeCategoryId, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveCategoryId(null);
    setActiveTags([]);
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
    Boolean(query.trim()) || activeCategoryId !== null || activeTags.length > 0;

  const userInitial = (
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    "?"
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Vault</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setManagingCategories(true)}
              className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
              title="Manage categories"
            >
              <FolderCog size={18} />
              <span className="hidden sm:inline">Categories</span>
            </button>

            <UploadDocument categories={categories} />

            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
              <div
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-semibold"
                title={user?.email ?? undefined}
              >
                {userInitial}
              </div>
              <button
                onClick={() => signOutUser()}
                title="Sign out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={24} />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-lg shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            placeholder="Search by title, category, tag, or notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategoryId(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategoryId === null
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const isSelected = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setActiveCategoryId(isSelected ? null : category.id)
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TagIcon size={14} /> Filter by tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {!loaded
              ? "Loading…"
              : hasFilters
                ? `Results (${results.length})`
                : `All Documents (${results.length})`}
          </h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        {!loaded ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={28} />
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
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
            <FileText className="mx-auto text-slate-300 mb-3" size={32} />
            {documents.length === 0 ? (
              <p>Your archive is empty. Upload your first document to get started.</p>
            ) : (
              <p>No documents match your search or filters.</p>
            )}
          </div>
        )}
      </main>

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

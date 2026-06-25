"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { parseTags, updateDocument } from "@/lib/documents";
import type { Category, DocumentMeta } from "@/lib/types";

interface EditDocumentProps {
  document: DocumentMeta;
  categories: Category[];
  onClose: () => void;
}

export default function EditDocument({
  document,
  categories,
  onClose,
}: EditDocumentProps) {
  const [title, setTitle] = useState(document.title);
  const [categoryId, setCategoryId] = useState(document.categoryId ?? "");
  const [tags, setTags] = useState(document.tags.join(", "));
  const [notes, setNotes] = useState(document.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateDocument(document.id, {
        title,
        categoryId: categoryId || null,
        tags: parseTags(tags),
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="card relative z-10 w-full max-w-md animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-base font-semibold text-white">Edit document</h3>
          <button onClick={onClose} className="icon-btn h-8 w-8">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="label">Document title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="" className="bg-ink-850">
                Uncategorized
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-ink-850">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Tags <span className="text-slate-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="e.g. lease, rental, 2024"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Optional description to help you find this later"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

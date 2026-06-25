"use client";

import React, { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { addDocument, parseTags } from "@/lib/documents";
import type { Category } from "@/lib/types";

export default function UploadDocument({
  categories,
}: {
  categories: Category[];
}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setCategoryId("");
    setTags("");
    setNotes("");
    setFile(null);
    setError(null);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setSaving(true);
    setError(null);
    try {
      await addDocument(user.uid, file, {
        title,
        categoryId: categoryId || null,
        tags: parseTags(tags),
        notes,
      });
      close();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        <Upload size={18} />
        <span>Upload</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div className="card relative z-10 w-full max-w-md animate-fade-in-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h3 className="text-base font-semibold text-white">Upload document</h3>
              <button onClick={close} className="icon-btn h-8 w-8">
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
                  placeholder="e.g. Apartment Lease 2024"
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

              <div>
                <label className="label">File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-300 hover:file:bg-brand-500/25"
                  required
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
                  onClick={close}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Uploading…" : "Save document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/categories";
import type { Category } from "@/lib/types";

function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await renameCategory(category.id, trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (
      !window.confirm(
        `Delete category "${category.name}"? Documents in it will become uncategorized.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteCategory(category.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex items-center gap-2 py-2">
      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="input flex-1 py-1.5"
          />
          <button
            onClick={save}
            disabled={busy}
            title="Save"
            className="rounded-lg p-1.5 text-brand-300 transition-colors hover:bg-brand-500/15 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={() => {
              setName(category.name);
              setEditing(false);
            }}
            title="Cancel"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate text-slate-200">{category.name}</span>
          <button
            onClick={() => setEditing(true)}
            title="Rename"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={remove}
            disabled={busy}
            title="Delete"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </>
      )}
    </li>
  );
}

interface CategoryManagerProps {
  categories: Category[];
  uid: string;
  onClose: () => void;
}

export default function CategoryManager({
  categories,
  uid,
  onClose,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await addCategory(uid, trimmed);
      setNewName("");
    } finally {
      setAdding(false);
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
          <h3 className="text-base font-semibold text-white">Manage categories</h3>
          <button onClick={onClose} className="icon-btn h-8 w-8">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleAdd} className="mb-4 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name"
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="btn-primary shrink-0"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add
            </button>
          </form>

          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

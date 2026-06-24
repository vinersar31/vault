"use client";

import { useState } from "react";
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
            className="flex-1 px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={save}
            disabled={busy}
            title="Save"
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={() => {
              setName(category.name);
              setEditing(false);
            }}
            title="Cancel"
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-slate-800">{category.name}</span>
          <button
            onClick={() => setEditing(true)}
            title="Rename"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={remove}
            disabled={busy}
            title="Delete"
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
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

  const handleAdd = async (e: React.FormEvent) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-slate-800">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-lg">Manage Categories</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add
            </button>
          </form>

          {categories.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
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

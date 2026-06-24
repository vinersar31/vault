// Firestore CRUD for user-defined categories (House, Car, Others, ...).
// Queries filter by owner only and sort in memory to avoid composite indexes.

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { Category } from "./types";

const COLLECTION = "categories";
const DEFAULT_CATEGORIES = ["House", "Car", "Others"];

/** Subscribe to the current user's categories (sorted by name). */
export function subscribeCategories(
  uid: string,
  callback: (categories: Category[]) => void
): () => void {
  const db = getDb();
  const categoriesQuery = query(
    collection(db, COLLECTION),
    where("ownerUid", "==", uid)
  );
  return onSnapshot(categoriesQuery, (snapshot) => {
    const items = snapshot.docs.map(
      (snap) => ({ id: snap.id, ...(snap.data() as Omit<Category, "id">) })
    );
    items.sort((a, b) => a.name.localeCompare(b.name));
    callback(items);
  });
}

export async function addCategory(uid: string, name: string): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, COLLECTION), {
    name: name.trim(),
    ownerUid: uid,
    createdAt: Date.now(),
  });
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, id), { name: name.trim() });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Seed the default categories the first time a user signs in. */
export async function ensureDefaultCategories(uid: string): Promise<void> {
  const db = getDb();
  const existing = await getDocs(
    query(collection(db, COLLECTION), where("ownerUid", "==", uid))
  );
  if (!existing.empty) return;

  const batch = writeBatch(db);
  const now = Date.now();
  DEFAULT_CATEGORIES.forEach((name, index) => {
    const ref = doc(collection(db, COLLECTION));
    batch.set(ref, { name, ownerUid: uid, createdAt: now + index });
  });
  await batch.commit();
}

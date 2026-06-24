// Firestore + Storage operations for archived documents.
// Files live in Storage under users/{uid}/documents/{docId}/{fileName};
// metadata lives in the `documents` Firestore collection.

import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getDb, getFirebaseStorage } from "./firebase";
import type { DocumentInput, DocumentMeta } from "./types";

const COLLECTION = "documents";

/** Normalize a comma-separated tag string into trimmed, de-duplicated tags. */
export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of input.split(",")) {
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

/** Subscribe to the current user's documents, newest first. */
export function subscribeDocuments(
  uid: string,
  callback: (documents: DocumentMeta[]) => void
): () => void {
  const db = getDb();
  const documentsQuery = query(
    collection(db, COLLECTION),
    where("ownerUid", "==", uid)
  );
  return onSnapshot(documentsQuery, (snapshot) => {
    const items = snapshot.docs.map(
      (snap) => ({ id: snap.id, ...(snap.data() as Omit<DocumentMeta, "id">) })
    );
    items.sort((a, b) => b.createdAt - a.createdAt);
    callback(items);
  });
}

/** Upload a file to Storage and create its metadata document. */
export async function addDocument(
  uid: string,
  file: File,
  input: DocumentInput
): Promise<void> {
  const db = getDb();
  const storage = getFirebaseStorage();
  // Pre-generate the doc id so the storage path can reference it.
  const ref = doc(collection(db, COLLECTION));
  const storagePath = `users/${uid}/documents/${ref.id}/${file.name}`;
  const fileRef = storageRef(storage, storagePath);

  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  const now = Date.now();
  const data: Omit<DocumentMeta, "id"> = {
    title: input.title.trim(),
    categoryId: input.categoryId,
    tags: input.tags,
    notes: input.notes.trim(),
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    storagePath,
    downloadURL,
    ownerUid: uid,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(ref, data);
}

/** Update editable metadata for an existing document. */
export async function updateDocument(
  id: string,
  input: DocumentInput
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, id), {
    title: input.title.trim(),
    categoryId: input.categoryId,
    tags: input.tags,
    notes: input.notes.trim(),
    updatedAt: Date.now(),
  });
}

/** Delete a document's stored file and its metadata. */
export async function deleteDocument(document: DocumentMeta): Promise<void> {
  const db = getDb();
  const storage = getFirebaseStorage();
  try {
    await deleteObject(storageRef(storage, document.storagePath));
  } catch (error) {
    // The file may already be gone; still remove the metadata record.
    console.warn("Could not delete stored file:", error);
  }
  await deleteDoc(doc(db, COLLECTION, document.id));
}

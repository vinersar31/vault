// Shared domain types for the Vault document archive.

/** A user-defined grouping such as House, Car, or Others. */
export interface Category {
  id: string;
  name: string;
  /** UID of the owner; used by security rules to scope access. */
  ownerUid: string;
  /** Creation time as epoch milliseconds. */
  createdAt: number;
}

/** Metadata describing a single archived document and its stored file. */
export interface DocumentMeta {
  id: string;
  title: string;
  /** Id of the owning {@link Category}, or null when uncategorized. */
  categoryId: string | null;
  /** Freeform, lowercase-normalized labels. */
  tags: string[];
  /** Optional notes shown in detail views and included in search. */
  notes: string;
  fileName: string;
  fileType: string;
  /** File size in bytes. */
  fileSize: number;
  /** Path of the file within Firebase Storage. */
  storagePath: string;
  /** Public download URL returned by Firebase Storage. */
  downloadURL: string;
  ownerUid: string;
  /** Creation time as epoch milliseconds. */
  createdAt: number;
  /** Last update time as epoch milliseconds. */
  updatedAt: number;
}

/** Fields the user can edit when creating or updating a document. */
export interface DocumentInput {
  title: string;
  categoryId: string | null;
  tags: string[];
  notes: string;
}

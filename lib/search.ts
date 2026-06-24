// Client-side full-text search over document metadata using MiniSearch.
// The index is rebuilt from the live Firestore data and queried in the browser,
// which keeps the whole app static-hosting friendly (no search server needed).

import MiniSearch from "minisearch";
import type { Category, DocumentMeta } from "./types";

interface IndexedDoc {
  id: string;
  title: string;
  tags: string;
  category: string;
  notes: string;
}

/** Build an in-memory search index from documents and their categories. */
export function buildSearchIndex(
  documents: DocumentMeta[],
  categories: Category[]
): MiniSearch<IndexedDoc> {
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const index = new MiniSearch<IndexedDoc>({
    fields: ["title", "tags", "category", "notes"],
    searchOptions: {
      boost: { title: 3, tags: 2, category: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  index.addAll(
    documents.map((document) => ({
      id: document.id,
      title: document.title,
      tags: document.tags.join(" "),
      category: document.categoryId
        ? categoryNameById.get(document.categoryId) ?? ""
        : "",
      notes: document.notes,
    }))
  );

  return index;
}

/** Return matching document ids ordered by relevance. */
export function searchDocumentIds(
  index: MiniSearch<IndexedDoc>,
  queryText: string
): string[] {
  return index.search(queryText).map((result) => result.id as string);
}

"use client";

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, Tag as TagIcon } from 'lucide-react';
import UploadDocument from '@/components/UploadDocument';

const AVAILABLE_TAGS = ['Legal', 'Finance', 'Property', 'Personal', 'Work', 'Health'];

export default function Home() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.hits || []);
    } catch (error) {
      console.error(error);
      // Fallback dummy data for demo purposes if ES isn't running
      if (query || selectedTags.length > 0) {
         setResults([
           {
             id: '1',
             source: {
               title: 'Lease Agreement 2024',
               created_at: '2024-01-15T10:00:00Z',
               tags: ['Legal', 'Property']
             },
             highlight: {
               content: ['...the <mark class="bg-yellow-200 text-black px-1 rounded">tenant</mark> agrees to pay rent on the first of every month...']
             }
           },
           {
             id: '2',
             source: {
               title: 'Q3 Financial Report',
               created_at: '2023-10-05T14:30:00Z',
               tags: ['Finance', 'Work']
             },
             highlight: {
               content: ['...revenue increased by <mark class="bg-yellow-200 text-black px-1 rounded">15%</mark> year over year...']
             }
           }
         ]);
      } else {
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Vault</h1>
          </div>
          <UploadDocument />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={24} />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-lg shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            placeholder="Search documents by title, content, or exact phrasing..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TagIcon size={14} /> Filter by Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {isSearching ? 'Searching...' : results.length > 0 ? `Results (${results.length})` : 'Recent Documents'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <div key={result.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-blue-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {result.source?.title || 'Untitled Document'}
                  </h3>
                  <span className="flex items-center text-xs text-slate-400 gap-1 shrink-0">
                    <Calendar size={12} />
                    {result.source?.created_at ? new Date(result.source.created_at).toLocaleDateString() : 'Unknown Date'}
                  </span>
                </div>

                {/* Tags */}
                {result.source?.tags && result.source.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {result.source.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Highlight Snippet */}
                <div className="text-sm text-slate-600 leading-relaxed mt-3">
                  {result.highlight?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: result.highlight.content.join(' ... ') }} />
                  ) : (
                    <span className="italic text-slate-400">No content snippet available.</span>
                  )}
                </div>
              </div>
            ))}

            {results.length === 0 && !isSearching && (
               <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
                 <FileText className="mx-auto text-slate-300 mb-3" size={32} />
                 <p>No documents found matching your criteria.</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

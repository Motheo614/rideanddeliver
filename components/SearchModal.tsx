'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';

export interface SearchIndexItem {
  title: string;
  excerpt: string;
  category: string;
  href: string;
}

interface SearchContextValue {
  openSearch: (initialQuery?: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearchModal() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchModal must be used inside <SearchProvider>');
  return ctx;
}

const QUICK_JUMPS = [
  { label: 'U-Locks & Anti-Theft', query: 'lock' },
  { label: 'MIPS Helmets', query: 'helmet' },
  { label: 'Waterproof Phone Mounts', query: 'phone mount' },
  { label: 'Delivery Backpacks', query: 'backpack' },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function SearchProvider({
  index,
  children,
}: {
  index: SearchIndexItem[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const triggerRef = useRef<HTMLElement | null>(null);

  const openSearch = useCallback((query = '') => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setInitialQuery(query);
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    const trigger = triggerRef.current;
    // Wait for the dialog to unmount before restoring focus.
    requestAnimationFrame(() => trigger?.focus());
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) closeSearch();
        else openSearch();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  const value = useMemo(() => ({ openSearch }), [openSearch]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {isOpen && (
        <SearchModal index={index} initialQuery={initialQuery} onClose={closeSearch} />
      )}
    </SearchContext.Provider>
  );
}

function SearchModal({
  index,
  initialQuery,
  onClose,
}: {
  index: SearchIndexItem[];
  initialQuery: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const results = useMemo(() => {
    const tokens = normalize(query).split(' ').filter(Boolean);
    if (tokens.length === 0) return [];
    return index
      .filter((item) => {
        const haystack = normalize(`${item.title} ${item.category} ${item.excerpt}`);
        return tokens.every((t) => haystack.includes(t));
      })
      .slice(0, 8);
  }, [index, query]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-charcoal/70 px-4 pt-[10vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <Search className="h-5 w-5 shrink-0 text-body" aria-hidden="true" />
          <h2 id={titleId} className="sr-only">
            Search guides
          </h2>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) {
                router.push(results[0].href);
                onClose();
              }
            }}
            placeholder="Search guides, categories, gear…"
            aria-label="Search guides"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base text-charcoal placeholder:text-body focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-md p-1.5 text-body hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-body">
                Quick jump
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_JUMPS.map((jump) => (
                  <button
                    key={jump.label}
                    type="button"
                    onClick={() => {
                      setQuery(jump.query);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-gray-200 bg-offwhite px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:border-brand-red hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                  >
                    {jump.label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p role="status" className="py-6 text-center text-sm text-body">
              No guides match “{query}”. Try a broader term like “helmet” or “lock”.
            </p>
          ) : (
            <ul>
              <li className="sr-only" role="status">
                {results.length} results
              </li>
              {results.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                      onClose();
                    }}
                    className="group flex items-start gap-3 rounded-lg p-3 hover:bg-offwhite focus-visible:bg-offwhite focus-visible:outline-2 focus-visible:outline-brand-red"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-widest text-brand-red">
                        {item.category}
                      </span>
                      <span className="mt-0.5 block font-bold text-charcoal group-hover:text-brand-red">
                        {item.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-body">
                        {item.excerpt}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-body" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-gray-200 bg-offwhite px-4 py-2 text-xs text-body">
          Press <kbd className="rounded border border-gray-300 bg-white px-1">Esc</kbd> to close ·{' '}
          <kbd className="rounded border border-gray-300 bg-white px-1">Enter</kbd> opens the top
          result
        </p>
      </div>
    </div>
  );
}

export default SearchModal;

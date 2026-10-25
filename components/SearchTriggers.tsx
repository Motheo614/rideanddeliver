'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchModal } from './SearchModal';

export function SearchButton({ className = '' }: { className?: string }) {
  const { openSearch } = useSearchModal();
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      aria-label="Search guides (Ctrl or Cmd + K)"
      aria-haspopup="dialog"
      className={`btn btn-ghost !h-10 !w-10 !px-0 text-body ${className}`}
    >
      <Search className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}

export function HeroSearch({ tags }: { tags: string[] }) {
  const { openSearch } = useSearchModal();
  const [value, setValue] = useState('');

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          openSearch(value);
        }}
        className="flex items-center gap-1 rounded-2xl border border-hairline bg-white p-1.5 shadow-md transition-shadow duration-200 ease-out focus-within:border-brand-red/40 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-brand-red/20"
      >
        <label htmlFor="hero-search" className="sr-only">
          Search guides
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id="hero-search"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search helmets, locks, backpacks…"
            autoComplete="off"
            className="h-12 w-full rounded-xl bg-transparent pl-12 pr-2 text-base text-charcoal outline-none placeholder:text-body/80 md:h-14"
          />
        </div>
        <button type="submit" className="btn btn-primary !h-12 shrink-0 !px-5 md:!h-14 md:!px-7">
          Search<span className="hidden sm:inline">&nbsp;Guides</span>
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-body">Popular:</span>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => openSearch(tag)}
            className="h-8 rounded-full border border-hairline bg-white px-3.5 text-[13px] font-medium text-charcoal transition-colors duration-200 ease-out hover:border-brand-red/30 hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40 active:bg-red-50"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
